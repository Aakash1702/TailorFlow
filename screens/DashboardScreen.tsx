import React, { useState, useCallback } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { useFocusEffect, useNavigation, NavigatorScreenParams } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { StatCard } from "@/components/StatCard";
import { QuickActionTile } from "@/components/QuickActionTile";
import { SectionHeader } from "@/components/SectionHeader";
import { ActivityListItem } from "@/components/ActivityItem";
import { useTheme } from "@/hooks/useTheme";
import { useAnimatedMount } from "@/hooks/useAnimatedMount";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { formatCurrency } from "@/utils/storage";
import { DashboardStats, ActivityItem } from "@/types";

type MoreStackParamList = {
  MoreMenu: undefined;
  Payments: undefined;
  Analytics: undefined;
  Settings: undefined;
  AddPayment: undefined;
};

type RootTabParamList = {
  DashboardTab: undefined;
  CustomersTab: undefined;
  OrdersTab: undefined;
  EmployeesTab: undefined;
  MoreTab: NavigatorScreenParams<MoreStackParamList> | undefined;
};

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { getOrders, getPayments, getActivities, isOnline, isSyncing } = useData();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    completedToday: 0,
    todayRevenue: 0,
    pendingPayments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const statsAnimatedStyle = useAnimatedMount({ delay: 0, translateY: 15 });
  const actionsAnimatedStyle = useAnimatedMount({ delay: 100, translateY: 15 });
  const activityAnimatedStyle = useAnimatedMount({ delay: 200, translateY: 15 });

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
  }, [getOrders, getPayments, getActivities]);

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
      accentColor: theme.inProgress,
    },
    {
      title: "Completed Today",
      value: stats.completedToday.toString(),
      icon: "check-circle" as const,
      accentColor: theme.completed,
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: "trending-up" as const,
      accentColor: theme.accent,
    },
    {
      title: "Pending Payments",
      value: formatCurrency(stats.pendingPayments),
      icon: "dollar-sign" as const,
      accentColor: theme.warning,
    },
  ];

  const quickActions: Array<{
    title: string;
    icon: keyof typeof Feather.glyphMap;
    tab: keyof RootTabParamList;
    screen?: keyof MoreStackParamList;
  }> = [
    { title: "Customers", icon: "users", tab: "CustomersTab" },
    { title: "Orders", icon: "shopping-bag", tab: "OrdersTab" },
    { title: "Employees", icon: "briefcase", tab: "EmployeesTab" },
    { title: "Payments", icon: "credit-card", tab: "MoreTab", screen: "Payments" },
    { title: "Analytics", icon: "bar-chart-2", tab: "MoreTab", screen: "Analytics" },
    { title: "Settings", icon: "settings", tab: "MoreTab", screen: "Settings" },
  ];

  return (
    <ScreenScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    >
      <Animated.View style={[styles.statsGrid, statsAnimatedStyle]}>
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            accentColor={stat.accentColor}
          />
        ))}
      </Animated.View>

      <Animated.View style={actionsAnimatedStyle}>
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionTile
              key={index}
              title={action.title}
              icon={action.icon}
              onPress={() => {
                if (action.tab === "MoreTab" && action.screen) {
                  navigation.navigate("MoreTab", { screen: action.screen });
                } else if (action.tab === "CustomersTab") {
                  navigation.navigate("CustomersTab");
                } else if (action.tab === "OrdersTab") {
                  navigation.navigate("OrdersTab");
                } else if (action.tab === "EmployeesTab") {
                  navigation.navigate("EmployeesTab");
                } else {
                  navigation.navigate("MoreTab");
                }
              }}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={activityAnimatedStyle}>
        <SectionHeader title="Recent Activity" />
        {recentActivity.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="activity" size={28} color={theme.textSecondary} />
            </View>
            <ThemedText type="bodyMedium" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              No recent activity
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              Activity will appear here as you use the app
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.activityList, { backgroundColor: theme.backgroundDefault }]}>
            {recentActivity.map((activity, index) => (
              <ActivityListItem
                key={activity.id}
                activity={activity}
                isLast={index === recentActivity.length - 1}
              />
            ))}
          </View>
        )}
      </Animated.View>
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
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  emptyState: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  activityList: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
});
