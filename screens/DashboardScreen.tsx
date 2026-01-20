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

const GRADIENTS = {
  primary: ["#1A1A1A", "#333333"] as [string, string],
  primaryLight: ["#333333", "#4A4A4A"] as [string, string],
  accent: ["#D4AF37", "#E5C76B"] as [string, string],
  subtle: ["#4A4A4A", "#666666"] as [string, string],
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
      icon: "layers" as const,
      gradientColors: GRADIENTS.primary,
    },
    {
      title: "Completed",
      value: stats.completedToday.toString(),
      icon: "check-circle" as const,
      gradientColors: GRADIENTS.accent,
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: "trending-up" as const,
      gradientColors: GRADIENTS.accent,
    },
    {
      title: "Pending",
      value: formatCurrency(stats.pendingPayments),
      icon: "clock" as const,
      gradientColors: GRADIENTS.primaryLight,
    },
  ];

  const quickActions: Array<{
    title: string;
    icon: keyof typeof Feather.glyphMap;
    gradientColors: [string, string];
    tab: keyof RootTabParamList;
    screen?: keyof MoreStackParamList;
  }> = [
    { title: "Customers", icon: "users", gradientColors: GRADIENTS.primary, tab: "CustomersTab" },
    { title: "Orders", icon: "package", gradientColors: GRADIENTS.primaryLight, tab: "OrdersTab" },
    { title: "Team", icon: "user-check", gradientColors: GRADIENTS.subtle, tab: "EmployeesTab" },
    { title: "Payments", icon: "credit-card", gradientColors: GRADIENTS.accent, tab: "MoreTab", screen: "Payments" },
    { title: "Analytics", icon: "pie-chart", gradientColors: GRADIENTS.primary, tab: "MoreTab", screen: "Analytics" },
    { title: "Settings", icon: "sliders", gradientColors: GRADIENTS.primaryLight, tab: "MoreTab", screen: "Settings" },
  ];

  return (
    <ScreenScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
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
            gradientColors={stat.gradientColors}
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
              gradientColors={action.gradientColors}
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
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Feather name="inbox" size={32} color="#C7C7CC" />
            </View>
            <ThemedText style={styles.emptyTitle}>
              No recent activity
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Activity will appear here as you use the app
            </ThemedText>
          </View>
        ) : (
          <View style={styles.activityList}>
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
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
});
