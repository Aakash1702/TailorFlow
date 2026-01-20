import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { GradientFAB } from "@/components/GradientFAB";
import { useData } from "@/contexts/DataContext";
import { Spacing, Shadows } from "@/constants/theme";
import { OrdersStackParamList } from "@/navigation/OrdersStackNavigator";
import { formatCurrency, formatDate } from "@/utils/storage";
import { Order, OrderStatus } from "@/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const STATUS_CONFIG: Record<OrderStatus | "all", { label: string; colors: [string, string] }> = {
  all: { label: "All", colors: ["#667EEA", "#764BA2"] },
  pending: { label: "Pending", colors: ["#F2994A", "#F2C94C"] },
  inProgress: { label: "In Progress", colors: ["#4FACFE", "#00F2FE"] },
  completed: { label: "Completed", colors: ["#11998E", "#38EF7D"] },
  delivered: { label: "Delivered", colors: ["#A18CD1", "#FBC2EB"] },
};

export default function OrdersScreen() {
  const { getOrders } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const loadOrders = useCallback(async () => {
    const data = await getOrders();
    setOrders(data);
  }, [getOrders]);

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

  const getStatusColors = (status: OrderStatus): [string, string] => {
    return STATUS_CONFIG[status]?.colors || ["#8E8E93", "#8E8E93"];
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const isPaid = item.paidAmount >= item.amount;
    const isOverdue = new Date(item.dueDate) < new Date() && item.status !== "delivered";
    const statusColors = getStatusColors(item.status);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          Shadows.level1,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <ThemedText style={styles.orderTitle} numberOfLines={1}>
              {item.description}
            </ThemedText>
            <ThemedText style={styles.customerName} numberOfLines={1}>
              {item.customerName}
            </ThemedText>
          </View>
          <LinearGradient
            colors={statusColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <ThemedText style={styles.statusText}>
              {item.status === "inProgress" ? "In Progress" : item.status}
            </ThemedText>
          </LinearGradient>
        </View>
        <View style={styles.orderFooter}>
          <View style={styles.orderMeta}>
            <Feather name="calendar" size={14} color={isOverdue ? "#DC2626" : "#8E8E93"} />
            <ThemedText style={[styles.metaText, isOverdue && { color: "#DC2626" }]}>
              Due {formatDate(item.dueDate)}
            </ThemedText>
          </View>
          <View style={styles.orderAmount}>
            <ThemedText style={styles.amountText}>
              {formatCurrency(item.amount)}
            </ThemedText>
            {!isPaid ? (
              <ThemedText style={styles.dueText}>
                {formatCurrency(item.amount - item.paidAmount)} due
              </ThemedText>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
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
            {(Object.keys(STATUS_CONFIG) as (OrderStatus | "all")[]).map((key) => {
              const config = STATUS_CONFIG[key];
              const isActive = statusFilter === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setStatusFilter(key)}
                  style={{ marginRight: Spacing.sm }}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={config.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.filterChip}
                    >
                      <ThemedText style={styles.filterTextActive}>
                        {config.label}
                      </ThemedText>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.filterChip, styles.filterChipInactive]}>
                      <ThemedText style={styles.filterTextInactive}>
                        {config.label}
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Feather name="package" size={32} color="#C7C7CC" />
            </View>
            <ThemedText style={styles.emptyTitle}>No orders found</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {statusFilter !== "all" ? "Try a different filter" : "Create your first order to get started"}
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
      <GradientFAB
        onPress={() => navigation.navigate("AddOrder")}
        bottom={tabBarHeight + Spacing.xl}
        gradientColors={["#4FACFE", "#00F2FE"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  filterContainer: {
    marginBottom: Spacing.lg,
  },
  filterContent: {
    paddingRight: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  filterChipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  filterTextActive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterTextInactive: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    padding: Spacing.lg,
    borderRadius: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  orderTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  customerName: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "capitalize",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  orderAmount: {
    alignItems: "flex-end",
    gap: 2,
  },
  amountText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  dueText: {
    fontSize: 12,
    color: "#DC2626",
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
