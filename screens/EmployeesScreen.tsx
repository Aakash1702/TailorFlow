import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { GradientAvatar } from "@/components/GradientAvatar";
import { GradientFAB } from "@/components/GradientFAB";
import { useData } from "@/contexts/DataContext";
import { Spacing, Shadows } from "@/constants/theme";
import { EmployeesStackParamList } from "@/navigation/EmployeesStackNavigator";
import { Employee } from "@/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const ROLE_COLORS: Record<Employee["role"], [string, string]> = {
  admin: ["#667EEA", "#764BA2"],
  manager: ["#4FACFE", "#00F2FE"],
  tailor: ["#F2994A", "#F2C94C"],
};

export default function EmployeesScreen() {
  const { getEmployees } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<EmployeesStackParamList>>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const loadEmployees = useCallback(async () => {
    const data = await getEmployees();
    setEmployees(data);
  }, [getEmployees]);

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

  const renderEmployee = ({ item }: { item: Employee }) => {
    const roleColors = ROLE_COLORS[item.role] || ROLE_COLORS.tailor;
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.employeeCard,
          Shadows.level1,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
        onPress={() => navigation.navigate("EmployeeDetail", { employeeId: item.id })}
      >
        <GradientAvatar name={item.name} size={50} gradientColors={roleColors} />
        <View style={styles.employeeInfo}>
          <View style={styles.nameRow}>
            <ThemedText style={styles.employeeName} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <LinearGradient
              colors={roleColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.roleBadge}
            >
              <ThemedText style={styles.roleText}>
                {item.role}
              </ThemedText>
            </LinearGradient>
          </View>
          <ThemedText style={styles.employeePhone}>
            {item.phone}
          </ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Feather name="briefcase" size={12} color="#8E8E93" />
              <ThemedText style={styles.statText}>
                {item.assignedOrders.length} orders
              </ThemedText>
            </View>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.isActive ? "#34D399" : "#F87171" }
            ]} />
            <ThemedText style={[
              styles.statusText,
              { color: item.isActive ? "#059669" : "#DC2626" }
            ]}>
              {item.isActive ? "Active" : "Inactive"}
            </ThemedText>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color="#C7C7CC" />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenFlatList
        data={employees}
        renderItem={renderEmployee}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Feather name="user-check" size={32} color="#C7C7CC" />
            </View>
            <ThemedText style={styles.emptyTitle}>No team members yet</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Add your first employee to manage your team
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
      <GradientFAB
        onPress={() => navigation.navigate("AddEmployee")}
        bottom={tabBarHeight + Spacing.xl}
        gradientColors={["#0BA360", "#3CBA92"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  employeeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: Spacing.lg,
    borderRadius: 16,
    gap: Spacing.md,
  },
  employeeInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  employeePhone: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: Spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    padding: Spacing["2xl"],
    borderRadius: 20,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});
