import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { OrdersStackParamList } from "@/navigation/OrdersStackNavigator";
import { getOrders, updateOrder, deleteOrder, formatCurrency, formatDate } from "@/utils/storage";
import { Order, OrderStatus } from "@/types";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "pending", label: "Pending", icon: "clock" },
  { key: "inProgress", label: "In Progress", icon: "scissors" },
  { key: "completed", label: "Completed", icon: "check-circle" },
  { key: "delivered", label: "Delivered", icon: "truck" },
];

export default function OrderDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const route = useRoute<RouteProp<OrdersStackParamList, "OrderDetail">>();
  const [order, setOrder] = useState<Order | null>(null);

  const loadOrder = useCallback(async () => {
    const orders = await getOrders();
    const found = orders.find((o) => o.id === route.params.orderId);
    setOrder(found || null);
  }, [route.params.orderId]);

  useFocusEffect(
    useCallback(() => {
      loadOrder();
    }, [loadOrder])
  );

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date().toISOString() : order.completedAt,
      deliveredAt: newStatus === "delivered" ? new Date().toISOString() : order.deliveredAt,
    };

    await updateOrder(updatedOrder);
    setOrder(updatedOrder);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Order",
      "Are you sure you want to delete this order? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteOrder(route.params.orderId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getStatusIndex = () => {
    if (!order) return 0;
    return STATUS_STEPS.findIndex((s) => s.key === order.status);
  };

  if (!order) {
    return (
      <ScreenScrollView>
        <View style={styles.emptyState}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Order not found
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const isPaid = order.paidAmount >= order.amount;
  const statusIndex = getStatusIndex();

  return (
    <ScreenScrollView>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="h2">{order.description}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Customer: {order.customerName}
        </ThemedText>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Order Status
      </ThemedText>
      <View style={[styles.statusCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.statusSteps}>
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= statusIndex;
            const isCurrent = index === statusIndex;
            return (
              <View key={step.key} style={styles.statusStep}>
                <Pressable
                  style={[
                    styles.statusIcon,
                    {
                      backgroundColor: isActive ? theme[step.key] : theme.backgroundSecondary,
                      borderWidth: isCurrent ? 3 : 0,
                      borderColor: theme[step.key],
                    },
                  ]}
                  onPress={() => handleStatusUpdate(step.key)}
                >
                  <Feather
                    name={step.icon as any}
                    size={18}
                    color={isActive ? "#FFFFFF" : theme.textSecondary}
                  />
                </Pressable>
                <ThemedText
                  type="caption"
                  style={{
                    color: isActive ? theme.text : theme.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {step.label}
                </ThemedText>
                {index < STATUS_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.statusLine,
                      { backgroundColor: index < statusIndex ? theme.completed : theme.border },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Payment Details
      </ThemedText>
      <View style={[styles.paymentCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.paymentRow}>
          <ThemedText type="body">Total Amount</ThemedText>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {formatCurrency(order.amount)}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.paymentRow}>
          <ThemedText type="body">Paid Amount</ThemedText>
          <ThemedText type="body" style={{ color: theme.completed }}>
            {formatCurrency(order.paidAmount)}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.paymentRow}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            Balance Due
          </ThemedText>
          <ThemedText
            type="body"
            style={{ fontWeight: "600", color: isPaid ? theme.completed : theme.error }}
          >
            {isPaid ? "Paid in Full" : formatCurrency(order.amount - order.paidAmount)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Order Items
      </ThemedText>
      <View style={[styles.itemsCard, { backgroundColor: theme.backgroundDefault }]}>
        {order.items.length > 0 ? (
          order.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index < order.items.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.itemInfo}>
                <ThemedText type="body">{item.name}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Qty: {item.quantity}
                </ThemedText>
              </View>
              <ThemedText type="body">{formatCurrency(item.price * item.quantity)}</ThemedText>
            </View>
          ))
        ) : (
          <View style={styles.emptyItems}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              No items added
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Timeline
      </ThemedText>
      <View style={[styles.timelineCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.timelineRow}>
          <ThemedText type="body">Created</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {formatDate(order.createdAt)}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.timelineRow}>
          <ThemedText type="body">Due Date</ThemedText>
          <ThemedText
            type="small"
            style={{
              color:
                new Date(order.dueDate) < new Date() && order.status !== "delivered"
                  ? theme.error
                  : theme.textSecondary,
            }}
          >
            {formatDate(order.dueDate)}
          </ThemedText>
        </View>
        {order.completedAt ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.timelineRow}>
              <ThemedText type="body">Completed</ThemedText>
              <ThemedText type="small" style={{ color: theme.completed }}>
                {formatDate(order.completedAt)}
              </ThemedText>
            </View>
          </>
        ) : null}
        {order.deliveredAt ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.timelineRow}>
              <ThemedText type="body">Delivered</ThemedText>
              <ThemedText type="small" style={{ color: theme.delivered }}>
                {formatDate(order.deliveredAt)}
              </ThemedText>
            </View>
          </>
        ) : null}
      </View>

      {order.notes ? (
        <>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Notes
          </ThemedText>
          <View style={[styles.notesCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="body">{order.notes}</ThemedText>
          </View>
        </>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => navigation.navigate("AddOrder", { orderId: order.id })}
        >
          <Feather name="edit-2" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Edit Order
          </ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            { borderColor: theme.error, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={handleDelete}
        >
          <Feather name="trash-2" size={18} color={theme.error} />
        </Pressable>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  statusCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statusSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusStep: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statusLine: {
    position: "absolute",
    top: 20,
    left: "60%",
    right: "-60%",
    height: 2,
    zIndex: -1,
  },
  paymentCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  itemsCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  itemInfo: {
    gap: Spacing.xs,
  },
  emptyItems: {
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  timelineCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  notesCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.lg,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
