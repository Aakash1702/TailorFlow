import React, { useState, useCallback } from "react";
import { View, StyleSheet, RefreshControl, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { useFocusEffect, useNavigation, NavigatorScreenParams } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { SectionHeader } from "@/components/SectionHeader";
import { ActivityListItem } from "@/components/ActivityItem";
import { useTheme } from "@/hooks/useTheme";
import { useAnimatedMount } from "@/hooks/useAnimatedMount";
import { useData } from "@/contexts/DataContext";
import { Spacing, Shadows } from "@/constants/theme";
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

const SECTION_COLORS = {
  orders: {
    bg: "#E8F4F8",
    icon: "#2B7A8C",
    text: "#1E5A68",
  },
  completed: {
    bg: "#E8F5E9",
    icon: "#43A047",
    text: "#2E7D32",
  },
  revenue: {
    bg: "#FFF8E1",
    icon: "#F9A825",
    text: "#F57F17",
  },
  pending: {
    bg: "#FCE4EC",
    icon: "#E91E63",
    text: "#C2185B",
  },
  customers: {
    bg: "#EDE7F6",
    icon: "#7E57C2",
    text: "#5E35B1",
  },
  team: {
    bg: "#E3F2FD",
    icon: "#42A5F5",
    text: "#1976D2",
  },
  payments: {
    bg: "#FFF3E0",
    icon: "#FF9800",
    text: "#EF6C00",
  },
  analytics: {
    bg: "#F3E5F5",
    icon: "#AB47BC",
    text: "#8E24AA",
  },
  settings: {
    bg: "#ECEFF1",
    icon: "#78909C",
    text: "#546E7A",
  },
};

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { getOrders, getPayments, getActivities } = useData();
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
      colors: SECTION_COLORS.orders,
    },
    {
      title: "Completed",
      value: stats.completedToday.toString(),
      icon: "check-circle" as const,
      colors: SECTION_COLORS.completed,
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: "trending-up" as const,
      colors: SECTION_COLORS.revenue,
    },
    {
      title: "Pending",
      value: formatCurrency(stats.pendingPayments),
      icon: "clock" as const,
      colors: SECTION_COLORS.pending,
    },
  ];

  const quickActions: Array<{
    title: string;
    icon: keyof typeof Feather.glyphMap;
    colors: typeof SECTION_COLORS.orders;
    tab: keyof RootTabParamList;
    screen?: keyof MoreStackParamList;
  }> = [
    { title: "Customers", icon: "users", colors: SECTION_COLORS.customers, tab: "CustomersTab" },
    { title: "Orders", icon: "package", colors: SECTION_COLORS.orders, tab: "OrdersTab" },
    { title: "Team", icon: "user-check", colors: SECTION_COLORS.team, tab: "EmployeesTab" },
    { title: "Payments", icon: "credit-card", colors: SECTION_COLORS.payments, tab: "MoreTab", screen: "Payments" },
    { title: "Analytics", icon: "pie-chart", colors: SECTION_COLORS.analytics, tab: "MoreTab", screen: "Analytics" },
    { title: "Settings", icon: "sliders", colors: SECTION_COLORS.settings, tab: "MoreTab", screen: "Settings" },
  ];

  const handleActionPress = (action: typeof quickActions[0]) => {
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
  };

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
          <View
            key={index}
            style={[
              styles.statCard,
              { backgroundColor: "#FFFFFF" },
              Shadows.level1,
            ]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: stat.colors.bg },
              ]}
            >
              <Feather
                name={stat.icon}
                size={20}
                color={stat.colors.icon}
              />
            </View>
            <ThemedText style={[styles.statValue, { color: theme.text }]}>
              {stat.value}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: stat.colors.text }]}>
              {stat.title}
            </ThemedText>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={actionsAnimatedStyle}>
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Pressable
              key={index}
              onPress={() => handleActionPress(action)}
              style={({ pressed }) => [
                styles.actionTile,
                {
                  backgroundColor: action.colors.bg,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "rgba(255,255,255,0.7)" },
                ]}
              >
                <Feather
                  name={action.icon}
                  size={22}
                  color={action.colors.icon}
                />
              </View>
              <ThemedText style={[styles.actionTitle, { color: action.colors.text }]}>
                {action.title}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={activityAnimatedStyle}>
        <SectionHeader title="Recent Activity" />
        {recentActivity.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="inbox" size={32} color={theme.textSecondary} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              No recent activity
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
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
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
    borderRadius: 16,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  actionTile: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
  emptyState: {
    padding: Spacing["2xl"],
    borderRadius: 16,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  activityList: {
    borderRadius: 16,
    overflow: "hidden",
  },
});
