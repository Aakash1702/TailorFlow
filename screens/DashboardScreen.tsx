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
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
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
      icon: "layers" as const,
      highlight: false,
    },
    {
      title: "Completed",
      value: stats.completedToday.toString(),
      icon: "check-circle" as const,
      highlight: true,
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: "trending-up" as const,
      highlight: true,
    },
    {
      title: "Pending",
      value: formatCurrency(stats.pendingPayments),
      icon: "clock" as const,
      highlight: false,
    },
  ];

  const quickActions: Array<{
    title: string;
    icon: keyof typeof Feather.glyphMap;
    tab: keyof RootTabParamList;
    screen?: keyof MoreStackParamList;
    highlight?: boolean;
  }> = [
    { title: "Customers", icon: "users", tab: "CustomersTab" },
    { title: "Orders", icon: "package", tab: "OrdersTab" },
    { title: "Team", icon: "user-check", tab: "EmployeesTab" },
    { title: "Payments", icon: "credit-card", tab: "MoreTab", screen: "Payments", highlight: true },
    { title: "Analytics", icon: "pie-chart", tab: "MoreTab", screen: "Analytics" },
    { title: "Settings", icon: "sliders", tab: "MoreTab", screen: "Settings" },
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
              { backgroundColor: theme.backgroundDefault },
              Shadows.level1,
            ]}
          >
            <View
              style={[
                styles.statIconContainer,
                { backgroundColor: stat.highlight ? theme.accent + "15" : theme.backgroundSecondary },
              ]}
            >
              <Feather
                name={stat.icon}
                size={20}
                color={stat.highlight ? theme.accent : theme.text}
              />
            </View>
            <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
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
                  backgroundColor: theme.backgroundDefault,
                  borderColor: action.highlight ? theme.accent : theme.border,
                  borderWidth: action.highlight ? 1.5 : 1,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: action.highlight ? theme.accent + "15" : theme.backgroundSecondary },
                ]}
              >
                <Feather
                  name={action.icon}
                  size={22}
                  color={action.highlight ? theme.accent : theme.text}
                />
              </View>
              <ThemedText style={[styles.actionTitle, { color: theme.text }]}>
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
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
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
