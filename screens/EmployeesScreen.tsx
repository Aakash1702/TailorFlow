import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { EmployeesStackParamList } from "@/navigation/EmployeesStackNavigator";
import { getEmployees, getOrders } from "@/utils/storage";
import { Employee } from "@/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function EmployeesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<EmployeesStackParamList>>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const loadEmployees = useCallback(async () => {
    const data = await getEmployees();
    setEmployees(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [loadEmployees])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };

  const getRoleBadgeColor = (role: Employee["role"]) => {
    switch (role) {
      case "admin":
        return theme.primary;
      case "manager":
        return theme.info;
      case "tailor":
        return theme.accent;
      default:
        return theme.textSecondary;
    }
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <Pressable
      style={({ pressed }) => [
        styles.employeeCard,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() => navigation.navigate("EmployeeDetail", { employeeId: item.id })}
    >
      <View style={[styles.avatar, { backgroundColor: theme.accent + "20" }]}>
        <ThemedText type="h3" style={{ color: theme.accent }}>
          {item.name.charAt(0).toUpperCase()}
        </ThemedText>
      </View>
      <View style={styles.employeeInfo}>
        <View style={styles.nameRow}>
          <ThemedText type="h4" numberOfLines={1}>
            {item.name}
          </ThemedText>
          <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(item.role) + "15" }]}>
            <ThemedText
              type="caption"
              style={{ color: getRoleBadgeColor(item.role), textTransform: "capitalize" }}
            >
              {item.role}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {item.phone}
        </ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Feather name="briefcase" size={12} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {item.assignedOrders.length} orders
            </ThemedText>
          </View>
          <View style={[styles.statusDot, { backgroundColor: item.isActive ? theme.completed : theme.error }]} />
          <ThemedText type="caption" style={{ color: item.isActive ? theme.completed : theme.error }}>
            {item.isActive ? "Active" : "Inactive"}
          </ThemedText>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScreenFlatList
        data={employees}
        renderItem={renderEmployee}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
              No employees yet
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
              Add your first employee to manage your team
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: tabBarHeight + Spacing.xl,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={() => navigation.navigate("AddEmployee")}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  employeeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  employeeInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    gap: Spacing.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
