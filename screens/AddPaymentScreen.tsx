import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MoreStackParamList } from "@/navigation/MoreStackNavigator";
import { useData } from "@/contexts/DataContext";
import { formatCurrency } from "@/utils/storage";
import { Order, Payment } from "@/types";

const PAYMENT_MODES: { key: Payment["paymentMode"]; label: string; icon: string }[] = [
  { key: "cash", label: "Cash", icon: "dollar-sign" },
  { key: "card", label: "Card", icon: "credit-card" },
  { key: "upi", label: "UPI", icon: "smartphone" },
  { key: "wallet", label: "Wallet", icon: "briefcase" },
  { key: "bank", label: "Bank", icon: "home" },
];

export default function AddPaymentScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MoreStackParamList, "AddPayment">>();
  const { getOrders, addPayment } = useData();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState(route.params?.orderId || "");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<Payment["paymentMode"]>("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOrderPicker, setShowOrderPicker] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await getOrders();
    const unpaidOrders = data.filter((o: Order) => o.amount > o.paidAmount);
    setOrders(unpaidOrders);
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const balanceDue = selectedOrder ? selectedOrder.amount - selectedOrder.paidAmount : 0;

  const handleSave = async () => {
    if (!selectedOrderId) {
      Alert.alert("Required", "Please select an order");
      return;
    }
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert("Invalid", "Please enter a valid amount");
      return;
    }
    if (amountValue > balanceDue) {
      Alert.alert("Invalid", `Amount cannot exceed balance due (${formatCurrency(balanceDue)})`);
      return;
    }

    if (!selectedOrder) {
      Alert.alert("Error", "Selected order not found");
      return;
    }

    setLoading(true);
    try {
      await addPayment({
        orderId: selectedOrderId,
        customerId: selectedOrder.customerId,
        customerName: selectedOrder.customerName,
        amount: amountValue,
        paymentMode,
        notes: notes.trim() || undefined,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Select Order
      </ThemedText>
      <Pressable
        style={[styles.orderPicker, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        onPress={() => setShowOrderPicker(!showOrderPicker)}
      >
        {selectedOrder ? (
          <View style={styles.selectedOrder}>
            <View>
              <ThemedText type="body">{selectedOrder.description}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {selectedOrder.customerName} - Balance: {formatCurrency(balanceDue)}
              </ThemedText>
            </View>
          </View>
        ) : (
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Select an order with pending payment...
          </ThemedText>
        )}
        <Feather name="chevron-down" size={20} color={theme.textSecondary} />
      </Pressable>

      {showOrderPicker ? (
        <View style={[styles.orderList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ScrollView style={{ maxHeight: 200 }}>
            {orders.length === 0 ? (
              <ThemedText type="small" style={{ color: theme.textSecondary, padding: Spacing.lg }}>
                No orders with pending payments
              </ThemedText>
            ) : (
              orders.map((order) => (
                <Pressable
                  key={order.id}
                  style={[
                    styles.orderOption,
                    selectedOrderId === order.id && { backgroundColor: theme.primary + "10" },
                  ]}
                  onPress={() => {
                    setSelectedOrderId(order.id);
                    setShowOrderPicker(false);
                  }}
                >
                  <View style={styles.orderOptionInfo}>
                    <ThemedText type="body">{order.description}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {order.customerName}
                    </ThemedText>
                  </View>
                  <View style={styles.orderOptionAmount}>
                    <ThemedText type="small" style={{ color: theme.error }}>
                      {formatCurrency(order.amount - order.paidAmount)} due
                    </ThemedText>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      ) : null}

      <ThemedText type="h4" style={styles.sectionTitle}>
        Payment Details
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.inputRow}>
          <ThemedText type="body">Amount *</ThemedText>
          <View style={styles.amountInputRow}>
            <TextInput
              style={[styles.amountInput, { color: theme.text }]}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            {selectedOrder ? (
              <Pressable
                style={[styles.fullPayButton, { backgroundColor: theme.primary + "15" }]}
                onPress={() => setAmount(balanceDue.toString())}
              >
                <ThemedText type="caption" style={{ color: theme.primary }}>
                  Full: {formatCurrency(balanceDue)}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Payment Mode
      </ThemedText>
      <View style={styles.paymentModeGrid}>
        {PAYMENT_MODES.map((mode) => (
          <Pressable
            key={mode.key}
            style={[
              styles.paymentModeOption,
              {
                backgroundColor: paymentMode === mode.key ? theme.primary : theme.backgroundDefault,
                borderColor: paymentMode === mode.key ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setPaymentMode(mode.key)}
          >
            <Feather
              name={mode.icon as any}
              size={20}
              color={paymentMode === mode.key ? "#FFFFFF" : theme.text}
            />
            <ThemedText
              type="caption"
              style={{ color: paymentMode === mode.key ? "#FFFFFF" : theme.text }}
            >
              {mode.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Notes (Optional)
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        <TextInput
          style={[styles.notesInput, { color: theme.text }]}
          placeholder="Add any notes about this payment..."
          placeholderTextColor={theme.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          { backgroundColor: theme.primary, opacity: pressed || loading ? 0.8 : 1 },
        ]}
        onPress={handleSave}
        disabled={loading}
      >
        <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
          {loading ? "Recording..." : "Record Payment"}
        </ThemedText>
      </Pressable>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  orderPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  selectedOrder: {
    flex: 1,
  },
  orderList: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  orderOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  orderOptionInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  orderOptionAmount: {
    alignItems: "flex-end",
  },
  inputGroup: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  inputRow: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    padding: 0,
  },
  fullPayButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  paymentModeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  paymentModeOption: {
    width: "30%",
    flexGrow: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  notesInput: {
    fontSize: 16,
    padding: Spacing.lg,
    minHeight: 80,
  },
  saveButton: {
    marginTop: Spacing["2xl"],
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
