import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MoreStackParamList } from "@/navigation/MoreStackNavigator";
import { getPayments, getOrders, formatCurrency, formatDate, getRelativeTime } from "@/utils/storage";
import { Payment, Order } from "@/types";

type PaymentFilter = "all" | "today" | "week" | "month";

const FILTERS: { key: PaymentFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

export default function PaymentsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const paymentData = await getPayments();
    const orderData = await getOrders();
    setPayments(paymentData);
    setOrders(orderData);
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

  const getPaymentModeIcon = (mode: Payment["paymentMode"]) => {
    switch (mode) {
      case "cash":
        return "dollar-sign";
      case "card":
        return "credit-card";
      case "upi":
        return "smartphone";
      case "wallet":
        return "briefcase";
      case "bank":
        return "home";
      default:
        return "dollar-sign";
    }
  };

  const renderPayment = ({ item }: { item: Payment }) => (
    <View style={[styles.paymentCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.paymentIcon, { backgroundColor: theme.completed + "15" }]}>
        <Feather name={getPaymentModeIcon(item.paymentMode)} size={18} color={theme.completed} />
      </View>
      <View style={styles.paymentInfo}>
        <ThemedText type="body" numberOfLines={1}>
          {item.customerName}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textTransform: "capitalize" }}>
          {item.paymentMode} payment
        </ThemedText>
      </View>
      <View style={styles.paymentAmount}>
        <ThemedText type="body" style={{ color: theme.completed, fontWeight: "600" }}>
          +{formatCurrency(item.amount)}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {getRelativeTime(item.createdAt)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScreenFlatList
        data={filteredPayments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
                <Feather name="trending-up" size={20} color={theme.completed} />
                <ThemedText type="h3" style={{ color: theme.completed }}>
                  {formatCurrency(totalFiltered)}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {filter === "all" ? "Total Received" : `${FILTERS.find((f) => f.key === filter)?.label}`}
                </ThemedText>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
                <Feather name="alert-circle" size={20} color={theme.pending} />
                <ThemedText type="h3" style={{ color: theme.pending }}>
                  {formatCurrency(pendingPayments)}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Pending
                </ThemedText>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterContainer}
              contentContainerStyle={styles.filterContent}
            >
              {FILTERS.map((f) => (
                <Pressable
                  key={f.key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filter === f.key ? theme.primary : theme.backgroundDefault,
                      borderColor: filter === f.key ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setFilter(f.key)}
                >
                  <ThemedText
                    type="small"
                    style={{ color: filter === f.key ? "#FFFFFF" : theme.text }}
                  >
                    {f.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            <ThemedText type="h4" style={styles.sectionTitle}>
              Payment History
            </ThemedText>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="credit-card" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
              No payments found
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {filter !== "all" ? "Try a different filter" : "Record your first payment from an order"}
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
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={() => navigation.navigate("AddPayment")}
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
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
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
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  paymentAmount: {
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
    bottom: Spacing.xl,
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
