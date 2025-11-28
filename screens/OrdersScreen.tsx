import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { OrdersStackParamList } from "@/navigation/OrdersStackNavigator";
import { getOrders, formatCurrency, formatDate } from "@/utils/storage";
import { Order, OrderStatus } from "@/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const STATUS_FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "inProgress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "delivered", label: "Delivered" },
];

export default function OrdersScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const loadOrders = useCallback(async () => {
    const data = await getOrders();
    setOrders(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filteredOrders = orders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  const getStatusColor = (status: OrderStatus) => {
    return theme[status];
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const isPaid = item.paidAmount >= item.amount;
    const isOverdue = new Date(item.dueDate) < new Date() && item.status !== "delivered";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <ThemedText type="h4" numberOfLines={1}>
              {item.description}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.customerName}
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "15" }]}>
            <ThemedText type="caption" style={{ color: getStatusColor(item.status), textTransform: "capitalize" }}>
              {item.status === "inProgress" ? "In Progress" : item.status}
            </ThemedText>
          </View>
        </View>
        <View style={styles.orderFooter}>
          <View style={styles.orderMeta}>
            <Feather name="calendar" size={14} color={isOverdue ? theme.error : theme.textSecondary} />
            <ThemedText type="caption" style={{ color: isOverdue ? theme.error : theme.textSecondary }}>
              Due {formatDate(item.dueDate)}
            </ThemedText>
          </View>
          <View style={styles.orderAmount}>
            <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
              {formatCurrency(item.amount)}
            </ThemedText>
            {!isPaid ? (
              <ThemedText type="caption" style={{ color: theme.error }}>
                {formatCurrency(item.amount - item.paidAmount)} due
              </ThemedText>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScreenFlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {STATUS_FILTERS.map((filter) => (
              <Pressable
                key={filter.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      statusFilter === filter.key ? theme.primary : theme.backgroundDefault,
                    borderColor: statusFilter === filter.key ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setStatusFilter(filter.key)}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: statusFilter === filter.key ? "#FFFFFF" : theme.text,
                  }}
                >
                  {filter.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="shopping-bag" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
              No orders found
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {statusFilter !== "all" ? "Try a different filter" : "Create your first order to get started"}
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
        onPress={() => navigation.navigate("AddOrder")}
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
  filterContainer: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.xl,
  },
  filterContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  orderAmount: {
    alignItems: "flex-end",
    gap: Spacing.xs,
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
