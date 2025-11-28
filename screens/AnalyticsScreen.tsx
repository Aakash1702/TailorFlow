import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getOrders, getPayments, getCustomers, formatCurrency } from "@/utils/storage";
import { Order, Payment, Customer } from "@/types";

type DateRange = "7d" | "30d" | "all";

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "all", label: "All Time" },
];

export default function AnalyticsScreen() {
  const { theme } = useTheme();
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

  const kpis = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), icon: "trending-up", color: theme.completed },
    { title: "Total Orders", value: totalOrders.toString(), icon: "shopping-bag", color: theme.info },
    { title: "Avg. Order Value", value: formatCurrency(avgOrderValue), icon: "bar-chart-2", color: theme.accent },
    { title: "Completion Rate", value: `${completionRate}%`, icon: "check-circle", color: theme.primary },
  ];

  return (
    <ScreenScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {DATE_RANGES.map((range) => (
          <Pressable
            key={range.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: dateRange === range.key ? theme.primary : theme.backgroundDefault,
                borderColor: dateRange === range.key ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setDateRange(range.key)}
          >
            <ThemedText
              type="small"
              style={{ color: dateRange === range.key ? "#FFFFFF" : theme.text }}
            >
              {range.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Key Metrics
      </ThemedText>
      <View style={styles.kpiGrid}>
        {kpis.map((kpi, index) => (
          <View key={index} style={[styles.kpiCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.kpiIcon, { backgroundColor: kpi.color + "15" }]}>
              <Feather name={kpi.icon as any} size={18} color={kpi.color} />
            </View>
            <ThemedText type="h3" style={{ color: kpi.color }}>
              {kpi.value}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {kpi.title}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Order Status Overview
      </ThemedText>
      <View style={[styles.statusCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.pending }]} />
            <ThemedText type="body">Pending</ThemedText>
          </View>
          <ThemedText type="h4">{statusCounts.pending}</ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.inProgress }]} />
            <ThemedText type="body">In Progress</ThemedText>
          </View>
          <ThemedText type="h4">{statusCounts.inProgress}</ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.completed }]} />
            <ThemedText type="body">Completed</ThemedText>
          </View>
          <ThemedText type="h4">{statusCounts.completed}</ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.delivered }]} />
            <ThemedText type="body">Delivered</ThemedText>
          </View>
          <ThemedText type="h4">{statusCounts.delivered}</ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Outstanding Balance
      </ThemedText>
      <View style={[styles.balanceCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.balanceIcon, { backgroundColor: theme.error + "15" }]}>
          <Feather name="alert-circle" size={24} color={theme.error} />
        </View>
        <ThemedText type="h2" style={{ color: theme.error }}>
          {formatCurrency(pendingAmount)}
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Total pending payments from all orders
        </ThemedText>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Top Customers
      </ThemedText>
      {topCustomers.length > 0 ? (
        <View style={[styles.customersCard, { backgroundColor: theme.backgroundDefault }]}>
          {topCustomers.map((customer, index) => (
            <View
              key={customer.id}
              style={[
                styles.customerRow,
                index < topCustomers.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.customerRank}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  #{index + 1}
                </ThemedText>
              </View>
              <View style={[styles.customerAvatar, { backgroundColor: theme.primary + "20" }]}>
                <ThemedText type="body" style={{ color: theme.primary }}>
                  {customer.name.charAt(0)}
                </ThemedText>
              </View>
              <View style={styles.customerInfo}>
                <ThemedText type="body">{customer.name}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {customer.orderCount} orders
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            No customer data available
          </ThemedText>
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
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
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  balanceCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  customersCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  customerRank: {
    width: 24,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  customerInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  emptyCard: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
