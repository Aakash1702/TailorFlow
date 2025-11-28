import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { OrdersStackParamList } from "@/navigation/OrdersStackNavigator";
import {
  getOrders,
  getCustomers,
  addOrder,
  updateOrder,
  generateId,
  formatCurrency,
} from "@/utils/storage";
import { Order, Customer, OrderItem } from "@/types";

export default function AddOrderScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OrdersStackParamList, "AddOrder">>();
  const orderId = route.params?.orderId;
  const isEditing = !!orderId;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [loading, setLoading] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const customerData = await getCustomers();
    setCustomers(customerData);

    if (orderId) {
      const orders = await getOrders();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedCustomerId(order.customerId);
        setDescription(order.description);
        setDueDate(order.dueDate.split("T")[0]);
        setNotes(order.notes || "");
        setItems(order.items);
      }
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      setDueDate(tomorrow.toISOString().split("T")[0]);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) {
      Alert.alert("Required", "Please enter item name and price");
      return;
    }

    const price = parseFloat(newItemPrice);
    const qty = parseInt(newItemQty) || 1;

    if (isNaN(price) || price <= 0) {
      Alert.alert("Invalid", "Please enter a valid price");
      return;
    }

    setItems([
      ...items,
      {
        id: generateId(),
        name: newItemName.trim(),
        price,
        quantity: qty,
      },
    ]);

    setNewItemName("");
    setNewItemPrice("");
    setNewItemQty("1");
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSave = async () => {
    if (!selectedCustomerId) {
      Alert.alert("Required", "Please select a customer");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Required", "Please enter order description");
      return;
    }
    if (!dueDate) {
      Alert.alert("Required", "Please enter due date");
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    if (!selectedCustomer) {
      Alert.alert("Error", "Selected customer not found");
      return;
    }

    setLoading(true);
    try {
      const order: Order = {
        id: orderId || generateId(),
        customerId: selectedCustomerId,
        customerName: selectedCustomer.name,
        description: description.trim(),
        status: "pending",
        amount: totalAmount,
        paidAmount: 0,
        dueDate: new Date(dueDate).toISOString(),
        createdAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        items,
      };

      if (isEditing) {
        const orders = await getOrders();
        const existing = orders.find((o) => o.id === orderId);
        if (existing) {
          order.status = existing.status;
          order.paidAmount = existing.paidAmount;
          order.createdAt = existing.createdAt;
          order.completedAt = existing.completedAt;
          order.deliveredAt = existing.deliveredAt;
        }
        await updateOrder(order);
      } else {
        await addOrder(order);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Customer
      </ThemedText>
      <Pressable
        style={[styles.customerPicker, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        onPress={() => setShowCustomerPicker(!showCustomerPicker)}
      >
        {selectedCustomer ? (
          <View style={styles.selectedCustomer}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}>
              <ThemedText type="body" style={{ color: theme.primary }}>
                {selectedCustomer.name.charAt(0)}
              </ThemedText>
            </View>
            <View>
              <ThemedText type="body">{selectedCustomer.name}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {selectedCustomer.phone}
              </ThemedText>
            </View>
          </View>
        ) : (
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Select a customer...
          </ThemedText>
        )}
        <Feather name="chevron-down" size={20} color={theme.textSecondary} />
      </Pressable>

      {showCustomerPicker ? (
        <View style={[styles.customerList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {customers.length === 0 ? (
            <ThemedText type="small" style={{ color: theme.textSecondary, padding: Spacing.lg }}>
              No customers available. Add a customer first.
            </ThemedText>
          ) : (
            customers.map((customer) => (
              <Pressable
                key={customer.id}
                style={[
                  styles.customerOption,
                  selectedCustomerId === customer.id && { backgroundColor: theme.primary + "10" },
                ]}
                onPress={() => {
                  setSelectedCustomerId(customer.id);
                  setShowCustomerPicker(false);
                }}
              >
                <ThemedText type="body">{customer.name}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {customer.phone}
                </ThemedText>
              </Pressable>
            ))
          )}
        </View>
      ) : null}

      <ThemedText type="h4" style={styles.sectionTitle}>
        Order Details
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.inputRow}>
          <ThemedText type="body">Description *</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="e.g., Custom suit, Wedding dress"
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.inputRow}>
          <ThemedText type="body">Due Date *</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.textSecondary}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Order Items
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.addItemRow}>
          <TextInput
            style={[styles.itemNameInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Item name"
            placeholderTextColor={theme.textSecondary}
            value={newItemName}
            onChangeText={setNewItemName}
          />
          <TextInput
            style={[styles.itemPriceInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Price"
            placeholderTextColor={theme.textSecondary}
            value={newItemPrice}
            onChangeText={setNewItemPrice}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.itemQtyInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="Qty"
            placeholderTextColor={theme.textSecondary}
            value={newItemQty}
            onChangeText={setNewItemQty}
            keyboardType="number-pad"
          />
          <Pressable
            style={[styles.addItemButton, { backgroundColor: theme.primary }]}
            onPress={handleAddItem}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {items.map((item, index) => (
          <View key={item.id}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <ThemedText type="body">{item.name}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {formatCurrency(item.price)} x {item.quantity}
                </ThemedText>
              </View>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {formatCurrency(item.price * item.quantity)}
              </ThemedText>
              <Pressable onPress={() => handleRemoveItem(item.id)}>
                <Feather name="x" size={18} color={theme.error} />
              </Pressable>
            </View>
          </View>
        ))}

        {items.length > 0 ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.totalRow}>
              <ThemedText type="h4">Total</ThemedText>
              <ThemedText type="h3" style={{ color: theme.primary }}>
                {formatCurrency(totalAmount)}
              </ThemedText>
            </View>
          </>
        ) : null}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Notes
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        <TextInput
          style={[styles.notesInput, { color: theme.text }]}
          placeholder="Add any notes about this order..."
          placeholderTextColor={theme.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
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
          {loading ? "Saving..." : isEditing ? "Update Order" : "Create Order"}
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
  customerPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  selectedCustomer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  customerList: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    maxHeight: 200,
    overflow: "hidden",
  },
  customerOption: {
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  inputGroup: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  inputRow: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  addItemRow: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: "center",
  },
  itemNameInput: {
    flex: 2,
    fontSize: 14,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
  },
  itemPriceInput: {
    flex: 1,
    fontSize: 14,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
  },
  itemQtyInput: {
    width: 50,
    fontSize: 14,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    textAlign: "center",
  },
  addItemButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  itemInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  notesInput: {
    fontSize: 16,
    padding: Spacing.lg,
    minHeight: 100,
  },
  saveButton: {
    marginTop: Spacing["2xl"],
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
