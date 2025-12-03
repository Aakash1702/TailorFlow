import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { CustomersStackParamList } from "@/navigation/CustomersStackNavigator";
import { useData } from "@/contexts/DataContext";
import { formatCurrency, formatDate } from "@/utils/storage";
import { Customer, Order } from "@/types";

export default function CustomerDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<CustomersStackParamList>>();
  const route = useRoute<RouteProp<CustomersStackParamList, "CustomerDetail">>();
  const { getCustomers, getOrders, deleteCustomer } = useData();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  const loadCustomer = useCallback(async () => {
    const customers = await getCustomers();
    const found = customers.find((c) => c.id === route.params.customerId);
    setCustomer(found || null);

    const orders = await getOrders();
    const filtered = orders.filter((o) => o.customerId === route.params.customerId);
    setCustomerOrders(filtered);
  }, [route.params.customerId, getCustomers, getOrders]);

  useFocusEffect(
    useCallback(() => {
      loadCustomer();
    }, [loadCustomer])
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCustomer(route.params.customerId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!customer) {
    return (
      <ScreenScrollView>
        <View style={styles.emptyState}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Customer not found
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const measurementEntries = Object.entries(customer.measurements).filter(
    ([key, value]) => value !== undefined && key !== "custom"
  );

  return (
    <ScreenScrollView>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}>
          <ThemedText type="h1" style={{ color: theme.primary }}>
            {customer.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="h2" style={{ textAlign: "center" }}>
          {customer.name}
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {customer.phone}
        </ThemedText>
        {customer.email ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {customer.email}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statItem, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={{ color: theme.primary }}>
            {customerOrders.length}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Orders
          </ThemedText>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h3" style={{ color: customer.outstandingBalance > 0 ? theme.error : theme.completed }}>
            {formatCurrency(customer.outstandingBalance)}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Balance
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Measurements
      </ThemedText>
      {measurementEntries.length > 0 ? (
        <View style={[styles.measurementsCard, { backgroundColor: theme.backgroundDefault }]}>
          {measurementEntries.map(([key, value], index) => (
            <View
              key={key}
              style={[
                styles.measurementRow,
                index < measurementEntries.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <ThemedText type="body" style={{ textTransform: "capitalize" }}>
                {key.replace(/([A-Z])/g, " $1").trim()}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.primary }}>
                {value} in
              </ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            No measurements recorded
          </ThemedText>
        </View>
      )}

      <ThemedText type="h4" style={styles.sectionTitle}>
        Order History
      </ThemedText>
      {customerOrders.length > 0 ? (
        <View style={[styles.ordersCard, { backgroundColor: theme.backgroundDefault }]}>
          {customerOrders.slice(0, 5).map((order, index) => (
            <Pressable
              key={order.id}
              style={[
                styles.orderRow,
                index < Math.min(customerOrders.length, 5) - 1 && {
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
                  {formatDate(order.createdAt)}
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: theme[order.status] + "15" }]}>
                <ThemedText type="caption" style={{ color: theme[order.status], textTransform: "capitalize" }}>
                  {order.status === "inProgress" ? "In Progress" : order.status}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            No orders yet
          </ThemedText>
        </View>
      )}

      {customer.notes ? (
        <>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Notes
          </ThemedText>
          <View style={[styles.notesCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="body">{customer.notes}</ThemedText>
          </View>
        </>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => navigation.navigate("AddCustomer", { customerId: customer.id })}
        >
          <Feather name="edit-2" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Edit Customer
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
          <ThemedText type="body" style={{ color: theme.error }}>
            Delete
          </ThemedText>
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
  measurementsCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
  },
  measurementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
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
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  notesCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing["2xl"],
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
    marginBottom: Spacing.lg,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
});
