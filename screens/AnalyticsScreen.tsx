import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { GradientAvatar } from "@/components/GradientAvatar";
import { Spacing, Shadows } from "@/constants/theme";
import { getOrders, getPayments, getCustomers, formatCurrency } from "@/utils/storage";
import { Order, Payment, Customer } from "@/types";

type DateRange = "7d" | "30d" | "all";

const DATE_RANGES: { key: DateRange; label: string; colors: [string, string] }[] = [
  { key: "7d", label: "7 Days", colors: ["#11998E", "#38EF7D"] },
  { key: "30d", label: "30 Days", colors: ["#4FACFE", "#00F2FE"] },
  { key: "all", label: "All Time", colors: ["#667EEA", "#764BA2"] },
];

const KPI_CONFIG: { title: string; icon: keyof typeof Feather.glyphMap; colors: [string, string] }[] = [
  { title: "Total Revenue", icon: "trending-up", colors: ["#11998E", "#38EF7D"] },
  { title: "Total Orders", icon: "package", colors: ["#4FACFE", "#00F2FE"] },
  { title: "Avg. Order Value", icon: "bar-chart-2", colors: ["#F2994A", "#F2C94C"] },
  { title: "Completion Rate", icon: "check-circle", colors: ["#667EEA", "#764BA2"] },
];

const STATUS_CONFIG: Record<string, { label: string; colors: [string, string] }> = {
  pending: { label: "Pending", colors: ["#F2994A", "#F2C94C"] },
  inProgress: { label: "In Progress", colors: ["#4FACFE", "#00F2FE"] },
  completed: { label: "Completed", colors: ["#11998E", "#38EF7D"] },
  delivered: { label: "Delivered", colors: ["#A18CD1", "#FBC2EB"] },
};

export default function AnalyticsScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const loadData = useCallback(async () => {
    const [orderData, paymentData, customerData] = await Promise.all([
      getOrders(),
      getPayments(),
      getCustomers(),
    ]);
    setOrders(orderData);
    setPayments(paymentData);
    setCustomers(customerData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const now = new Date();
  const filterDate = dateRange === "7d" 
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : dateRange === "30d"
    ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    : new Date(0);

  const filteredOrders = orders.filter((o) => new Date(o.createdAt) >= filterDate);
  const filteredPayments = payments.filter((p) => new Date(p.createdAt) >= filterDate);

  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter((o) => o.status === "completed" || o.status === "delivered").length;
  const avgOrderValue = totalOrders > 0 ? filteredOrders.reduce((sum, o) => sum + o.amount, 0) / totalOrders : 0;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const pendingAmount = orders.reduce((sum, o) => sum + (o.amount - o.paidAmount), 0);

  const customerOrderCounts = orders.reduce((acc, o) => {
    acc[o.customerId] = (acc[o.customerId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCustomers = customers
    .map((c) => ({ ...c, orderCount: customerOrderCounts[c.id] || 0 }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  const statusCounts = {
    pending: orders.filter((o) => o.status === "pending").length,
    inProgress: orders.filter((o) => o.status === "inProgress").length,
    completed: orders.filter((o) => o.status === "completed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const kpiValues = [
    formatCurrency(totalRevenue),
    totalOrders.toString(),
    formatCurrency(avgOrderValue),
    `${completionRate}%`,
  ];

  return (
    <ScreenScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {DATE_RANGES.map((range) => {
          const isActive = dateRange === range.key;
          return (
            <Pressable
              key={range.key}
              onPress={() => setDateRange(range.key)}
              style={{ marginRight: Spacing.sm }}
            >
              {isActive ? (
                <LinearGradient
                  colors={range.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.filterChip}
                >
                  <ThemedText style={styles.filterTextActive}>{range.label}</ThemedText>
                </LinearGradient>
              ) : (
                <View style={[styles.filterChip, styles.filterChipInactive]}>
                  <ThemedText style={styles.filterTextInactive}>{range.label}</ThemedText>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <ThemedText style={styles.sectionTitle}>Key Metrics</ThemedText>
      <View style={styles.kpiGrid}>
        {KPI_CONFIG.map((kpi, index) => (
          <LinearGradient
            key={index}
            colors={kpi.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.kpiCard, Shadows.level1]}
          >
            <View style={styles.kpiIcon}>
              <Feather name={kpi.icon} size={20} color="#FFFFFF" />
            </View>
            <ThemedText style={styles.kpiValue}>{kpiValues[index]}</ThemedText>
            <ThemedText style={styles.kpiLabel}>{kpi.title}</ThemedText>
          </LinearGradient>
        ))}
      </View>

      <ThemedText style={styles.sectionTitle}>Order Status</ThemedText>
      <View style={[styles.statusCard, Shadows.level1]}>
        {Object.entries(statusCounts).map(([status, count], index) => {
          const config = STATUS_CONFIG[status];
          return (
            <View key={status}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <LinearGradient
                    colors={config.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.statusDot}
                  />
                  <ThemedText style={styles.statusLabel}>{config.label}</ThemedText>
                </View>
                <ThemedText style={styles.statusCount}>{count}</ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      <ThemedText style={styles.sectionTitle}>Outstanding Balance</ThemedText>
      <LinearGradient
        colors={["#FA709A", "#FEE140"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.balanceCard, Shadows.level1]}
      >
        <Feather name="alert-circle" size={28} color="#FFFFFF" />
        <ThemedText style={styles.balanceAmount}>{formatCurrency(pendingAmount)}</ThemedText>
        <ThemedText style={styles.balanceLabel}>Total pending from all orders</ThemedText>
      </LinearGradient>

      <ThemedText style={styles.sectionTitle}>Top Customers</ThemedText>
      {topCustomers.length > 0 ? (
        <View style={[styles.customersCard, Shadows.level1]}>
          {topCustomers.map((customer, index) => (
            <View key={customer.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.customerRow}>
                <View style={styles.customerRank}>
                  <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>
                </View>
                <GradientAvatar name={customer.name} size={40} />
                <View style={styles.customerInfo}>
                  <ThemedText style={styles.customerName}>{customer.name}</ThemedText>
                  <ThemedText style={styles.customerOrders}>{customer.orderCount} orders</ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyCard, Shadows.level1]}>
          <ThemedText style={styles.emptyText}>No customer data available</ThemedText>
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  kpiCard: {
    width: "48%",
    flexGrow: 1,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    gap: Spacing.xs,
  },
  kpiIcon: {
    marginBottom: Spacing.xs,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  kpiLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  statusCount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
  },
  balanceCard: {
    padding: Spacing.xl,
    borderRadius: 16,
    alignItems: "center",
    gap: Spacing.sm,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  customersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  customerRank: {
    width: 28,
    alignItems: "center",
  },
  rankText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
  },
  customerInfo: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  customerOrders: {
    fontSize: 13,
    color: "#8E8E93",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },
});
