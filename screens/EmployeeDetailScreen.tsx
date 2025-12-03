import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { EmployeesStackParamList } from "@/navigation/EmployeesStackNavigator";
import { useData } from "@/contexts/DataContext";
import { formatDate } from "@/utils/storage";
import { Employee, Order } from "@/types";

export default function EmployeeDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<EmployeesStackParamList>>();
  const route = useRoute<RouteProp<EmployeesStackParamList, "EmployeeDetail">>();
  const { getEmployees, getOrders, updateEmployee, deleteEmployee } = useData();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);

  const loadEmployee = useCallback(async () => {
    const employees = await getEmployees();
    const found = employees.find((e) => e.id === route.params.employeeId);
    setEmployee(found || null);

    if (found) {
      const orders = await getOrders();
      const assigned = orders.filter((o) => found.assignedOrders.includes(o.id));
      setAssignedOrders(assigned);
    }
  }, [route.params.employeeId, getEmployees, getOrders]);

  useFocusEffect(
    useCallback(() => {
      loadEmployee();
    }, [loadEmployee])
  );

  const handleToggleActive = async () => {
    if (!employee) return;
    const updated = { ...employee, isActive: !employee.isActive };
    await updateEmployee(updated);
    setEmployee(updated);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Employee",
      "Are you sure you want to delete this employee? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteEmployee(route.params.employeeId);
            navigation.goBack();
          },
        },
      ]
    );
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

  if (!employee) {
    return (
      <ScreenScrollView>
        <View style={styles.emptyState}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Employee not found
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const completedOrders = assignedOrders.filter((o) => o.status === "completed" || o.status === "delivered").length;
  const activeOrders = assignedOrders.filter((o) => o.status === "pending" || o.status === "inProgress").length;

  return (
    <ScreenScrollView>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatar, { backgroundColor: theme.accent + "20" }]}>
          <ThemedText type="h1" style={{ color: theme.accent }}>
            {employee.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="h2" style={{ textAlign: "center" }}>
          {employee.name}
        </ThemedText>
        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(employee.role) + "15" }]}>
          <ThemedText
            type="small"
            style={{ color: getRoleBadgeColor(employee.role), textTransform: "capitalize" }}
          >
            {employee.role}
          </ThemedText>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: employee.isActive ? theme.completed : theme.error }]} />
          <ThemedText type="body" style={{ color: employee.isActive ? theme.completed : theme.error }}>
            {employee.isActive ? "Active" : "Inactive"}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statItem, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={{ color: theme.primary }}>
            {activeOrders}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Active Orders
          </ThemedText>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={{ color: theme.completed }}>
            {completedOrders}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Completed
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Contact Information
      </ThemedText>
      <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.infoRow}>
          <Feather name="phone" size={18} color={theme.textSecondary} />
          <ThemedText type="body">{employee.phone}</ThemedText>
        </View>
        {employee.email ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.infoRow}>
              <Feather name="mail" size={18} color={theme.textSecondary} />
              <ThemedText type="body">{employee.email}</ThemedText>
            </View>
          </>
        ) : null}
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.infoRow}>
          <Feather name="calendar" size={18} color={theme.textSecondary} />
          <ThemedText type="body">Joined {formatDate(employee.joinedAt)}</ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Assigned Orders
      </ThemedText>
      {assignedOrders.length > 0 ? (
        <View style={[styles.ordersCard, { backgroundColor: theme.backgroundDefault }]}>
          {assignedOrders.slice(0, 5).map((order, index) => (
            <View
              key={order.id}
              style={[
                styles.orderRow,
                index < Math.min(assignedOrders.length, 5) - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.orderInfo}>
                <ThemedText type="body" numberOfLines={1}>
                  {order.description}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {order.customerName}
                </ThemedText>
              </View>
              <View style={[styles.orderStatusBadge, { backgroundColor: theme[order.status] + "15" }]}>
                <ThemedText
                  type="caption"
                  style={{ color: theme[order.status], textTransform: "capitalize" }}
                >
                  {order.status === "inProgress" ? "In Progress" : order.status}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            No orders assigned
          </ThemedText>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.toggleButton,
            {
              backgroundColor: employee.isActive ? theme.error + "15" : theme.completed + "15",
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          onPress={handleToggleActive}
        >
          <Feather
            name={employee.isActive ? "user-x" : "user-check"}
            size={18}
            color={employee.isActive ? theme.error : theme.completed}
          />
          <ThemedText
            type="body"
            style={{ color: employee.isActive ? theme.error : theme.completed }}
          >
            {employee.isActive ? "Deactivate" : "Activate"}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => navigation.navigate("AddEmployee", { employeeId: employee.id })}
        >
          <Feather name="edit-2" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Edit Employee
          </ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            { borderColor: theme.error, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={handleDelete}
        >
          <Feather name="trash-2" size={18} color={theme.error} />
        </Pressable>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  ordersCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  orderInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  orderStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  emptyCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
