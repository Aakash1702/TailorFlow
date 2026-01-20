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
import { MoreStackParamList } from "@/navigation/MoreStackNavigator";
import { formatCurrency, formatDate, getRelativeTime } from "@/utils/storage";
import { Payment, Order } from "@/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

type PaymentFilter = "all" | "today" | "week" | "month";

const FILTERS: { key: PaymentFilter; label: string; colors: [string, string] }[] = [
  { key: "all", label: "All", colors: ["#667EEA", "#764BA2"] },
  { key: "today", label: "Today", colors: ["#11998E", "#38EF7D"] },
  { key: "week", label: "This Week", colors: ["#4FACFE", "#00F2FE"] },
  { key: "month", label: "This Month", colors: ["#FA709A", "#FEE140"] },
];

const PAYMENT_MODE_CONFIG: Record<Payment["paymentMode"], { icon: keyof typeof Feather.glyphMap; colors: [string, string] }> = {
  cash: { icon: "dollar-sign", colors: ["#11998E", "#38EF7D"] },
  card: { icon: "credit-card", colors: ["#667EEA", "#764BA2"] },
  upi: { icon: "smartphone", colors: ["#FA709A", "#FEE140"] },
  wallet: { icon: "briefcase", colors: ["#4FACFE", "#00F2FE"] },
  bank: { icon: "home", colors: ["#A18CD1", "#FBC2EB"] },
};

export default function PaymentsScreen() {
  const { getPayments, getOrders } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const loadData = useCallback(async () => {
    const paymentData = await getPayments();
    const orderData = await getOrders();
    setPayments(paymentData);
    setOrders(orderData);
  }, [getPayments, getOrders]);

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

  const now = new Date();
  const today = now.toDateString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredPayments = payments.filter((p) => {
    const paymentDate = new Date(p.createdAt);
    switch (filter) {
      case "today":
        return paymentDate.toDateString() === today;
      case "week":
        return paymentDate >= weekAgo;
      case "month":
        return paymentDate >= monthAgo;
      default:
        return true;
    }
  });

  const totalFiltered = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = orders.reduce((sum, o) => sum + (o.amount - o.paidAmount), 0);

  const renderPayment = ({ item }: { item: Payment }) => {
    const config = PAYMENT_MODE_CONFIG[item.paymentMode] || PAYMENT_MODE_CONFIG.cash;
    return (
      <View style={[styles.paymentCard, Shadows.level1]}>
        <LinearGradient
          colors={config.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.paymentIcon}
        >
          <Feather name={config.icon} size={18} color="#FFFFFF" />
        </LinearGradient>
        <View style={styles.paymentInfo}>
          <ThemedText style={styles.paymentCustomer} numberOfLines={1}>
            {item.customerName}
          </ThemedText>
          <ThemedText style={styles.paymentMode}>
            {item.paymentMode} payment
          </ThemedText>
        </View>
        <View style={styles.paymentAmount}>
          <ThemedText style={styles.amountText}>
            +{formatCurrency(item.amount)}
          </ThemedText>
          <ThemedText style={styles.timeText}>
            {getRelativeTime(item.createdAt)}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenFlatList
        data={filteredPayments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <>
            <View style={styles.summaryRow}>
              <LinearGradient
                colors={["#11998E", "#38EF7D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.summaryCard, Shadows.level1]}
              >
                <Feather name="trending-up" size={24} color="#FFFFFF" />
                <ThemedText style={styles.summaryAmount}>
                  {formatCurrency(totalFiltered)}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>
                  {filter === "all" ? "Total Received" : FILTERS.find((f) => f.key === filter)?.label}
                </ThemedText>
              </LinearGradient>
              <LinearGradient
                colors={["#F2994A", "#F2C94C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.summaryCard, Shadows.level1]}
              >
                <Feather name="clock" size={24} color="#FFFFFF" />
                <ThemedText style={styles.summaryAmount}>
                  {formatCurrency(pendingPayments)}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>Pending</ThemedText>
              </LinearGradient>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {FILTERS.map((f) => {
                const isActive = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={{ marginRight: Spacing.sm }}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={f.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.filterChip}
                      >
                        <ThemedText style={styles.filterTextActive}>{f.label}</ThemedText>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.filterChip, styles.filterChipInactive]}>
                        <ThemedText style={styles.filterTextInactive}>{f.label}</ThemedText>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <ThemedText style={styles.sectionTitle}>Payment History</ThemedText>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Feather name="credit-card" size={32} color="#C7C7CC" />
            </View>
            <ThemedText style={styles.emptyTitle}>No payments yet</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Payments will appear here when recorded
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
      <GradientFAB
        onPress={() => navigation.navigate("AddPayment")}
        bottom={tabBarHeight + Spacing.xl}
        gradientColors={["#FA709A", "#FEE140"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    gap: Spacing.xs,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  summaryLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: Spacing.lg,
    borderRadius: 16,
    gap: Spacing.md,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentInfo: {
    flex: 1,
    gap: 2,
  },
  paymentCustomer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  paymentMode: {
    fontSize: 13,
    color: "#8E8E93",
    textTransform: "capitalize",
  },
  paymentAmount: {
    alignItems: "flex-end",
    gap: 2,
  },
  amountText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#059669",
  },
  timeText: {
    fontSize: 12,
    color: "#8E8E93",
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
