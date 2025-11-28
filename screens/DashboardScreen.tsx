import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, RefreshControl } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getOrders, getPayments, getActivities, formatCurrency, getRelativeTime } from "@/utils/storage";
import { DashboardStats, ActivityItem, Order } from "@/types";

type RootTabParamList = {
  DashboardTab: undefined;
  CustomersTab: undefined;
  OrdersTab: undefined;
  EmployeesTab: undefined;
  MoreTab: { screen?: string };
};

export default function DashboardScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootTabParamList>>();
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    completedToday: 0,
    todayRevenue: 0,
    pendingPayments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const orders = await getOrders();
    const payments = await getPayments();
    const activities = await getActivities();

    const today = new Date().toDateString();
    const activeOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "inProgress"
    ).length;
    const completedToday = orders.filter(
      (o) =>
        o.status === "completed" &&
        o.completedAt &&
        new Date(o.completedAt).toDateString() === today
    ).length;
    const todayPayments = payments.filter(
      (p) => new Date(p.createdAt).toDateString() === today
    );
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = orders.reduce(
      (sum, o) => sum + (o.amount - o.paidAmount),
      0
    );

    setStats({
      activeOrders,
      completedToday,
      todayRevenue,
      pendingPayments,
    });
    setRecentActivity(activities.slice(0, 5));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const statCards = [
    {
      title: "Active Orders",
      value: stats.activeOrders.toString(),
      icon: "clock" as const,
      color: theme.inProgress,
    },
    {
      title: "Completed Today",
      value: stats.completedToday.toString(),
      icon: "check-circle" as const,
      color: theme.completed,
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: "trending-up" as const,
      color: theme.accent,
    },
    {
      title: "Pending Payments",
      value: formatCurrency(stats.pendingPayments),
      icon: "alert-circle" as const,
      color: theme.pending,
    },
  ];

  const quickActions = [
    { title: "Customers", icon: "users" as const, tab: "CustomersTab" as const },
    { title: "Orders", icon: "shopping-bag" as const, tab: "OrdersTab" as const },
    { title: "Employees", icon: "briefcase" as const, tab: "EmployeesTab" as const },
    { title: "Payments", icon: "credit-card" as const, tab: "MoreTab" as const, screen: "Payments" },
    { title: "Analytics", icon: "bar-chart-2" as const, tab: "MoreTab" as const, screen: "Analytics" },
    { title: "Settings", icon: "settings" as const, tab: "MoreTab" as const, screen: "Settings" },
  ];

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "order_created":
        return "plus-circle";
      case "order_updated":
        return "edit";
      case "order_completed":
        return "check-circle";
      case "order_delivered":
        return "truck";
      case "payment_received":
        return "dollar-sign";
      default:
        return "activity";
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "order_created":
        return theme.info;
      case "order_updated":
        return theme.pending;
      case "order_completed":
        return theme.completed;
      case "order_delivered":
        return theme.delivered;
      case "payment_received":
        return theme.accent;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <ScreenScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.statCard,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.statIconContainer, { backgroundColor: stat.color + "20" }]}>
              <Feather name={stat.icon} size={20} color={stat.color} />
            </View>
            <ThemedText type="h2" style={[styles.statValue, { color: theme.primary }]}>
              {stat.value}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {stat.title}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Quick Actions
      </ThemedText>
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            onPress={() => {
              if (action.screen) {
                navigation.navigate(action.tab, { screen: action.screen });
              } else {
                navigation.navigate(action.tab);
              }
            }}
          >
            <Feather name={action.icon} size={28} color={theme.primary} />
            <ThemedText type="small" style={styles.actionTitle}>
              {action.title}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        Recent Activity
      </ThemedText>
      {recentActivity.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="activity" size={32} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
            No recent activity
          </ThemedText>
        </View>
      ) : (
        <View style={[styles.activityList, { backgroundColor: theme.backgroundDefault }]}>
          {recentActivity.map((activity, index) => (
            <View
              key={activity.id}
              style={[
                styles.activityItem,
                index < recentActivity.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.activityIconContainer,
                  { backgroundColor: getActivityColor(activity.type) + "20" },
                ]}
              >
                <Feather
                  name={getActivityIcon(activity.type)}
                  size={16}
                  color={getActivityColor(activity.type)}
                />
              </View>
              <View style={styles.activityContent}>
                <ThemedText type="body" numberOfLines={1}>
                  {activity.description}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {getRelativeTime(activity.timestamp)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  actionCard: {
    width: "31%",
    flexGrow: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionTitle: {
    textAlign: "center",
  },
  emptyState: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  activityList: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
    gap: Spacing.xs,
  },
});
