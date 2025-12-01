import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Modal, ScrollView } from "react-native";
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
  getEmployees,
  getExtrasPresets,
  addOrder,
  updateOrder,
  updateCustomerBalance,
  assignEmployeeToOrder,
  calculateItemTotal,
  calculateOrderTotal,
  generateId,
  formatCurrency,
} from "@/utils/storage";
import { Order, Customer, OrderItem, OrderItemExtra, Employee, ExtrasPreset } from "@/types";

export default function AddOrderScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OrdersStackParamList, "AddOrder">>();
  const orderId = route.params?.orderId;
  const isEditing = !!orderId;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [extrasPresets, setExtrasPresets] = useState<ExtrasPreset[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemBasePrice, setItemBasePrice] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemNotes, setItemNotes] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([]);
  const [customExtraLabel, setCustomExtraLabel] = useState("");
  const [customExtraAmount, setCustomExtraAmount] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const customerData = await getCustomers();
    setCustomers(customerData);
    
    const employeeData = await getEmployees();
    setEmployees(employeeData.filter(e => e.isActive));
    
    const presets = await getExtrasPresets();
    setExtrasPresets(presets);

    if (orderId) {
      const orders = await getOrders();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedCustomerId(order.customerId);
        setDescription(order.description);
        setDueDate(order.dueDate.split("T")[0]);
        setNotes(order.notes || "");
        const migratedItems = order.items.map(item => ({
          ...item,
          basePrice: (item as any).basePrice ?? (item as any).price ?? 0,
          extras: item.extras || [],
        }));
        setItems(migratedItems);
        setSelectedEmployeeId(order.assignedEmployeeId || "");
      }
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      setDueDate(tomorrow.toISOString().split("T")[0]);
    }
  };

  const openAddItemModal = () => {
    setEditingItemId(null);
    setItemName("");
    setItemBasePrice("");
    setItemQty("1");
    setItemNotes("");
    setSelectedExtras([]);
    setShowItemModal(true);
  };

  const openEditItemModal = (item: OrderItem) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemBasePrice(item.basePrice.toString());
    setItemQty(item.quantity.toString());
    setItemNotes(item.notes || "");
    setSelectedExtras(item.extras || []);
    setShowItemModal(true);
  };

  const toggleExtra = (preset: ExtrasPreset) => {
    const exists = selectedExtras.find(e => e.label === preset.label);
    if (exists) {
      setSelectedExtras(selectedExtras.filter(e => e.label !== preset.label));
    } else {
      setSelectedExtras([...selectedExtras, {
        id: generateId(),
        label: preset.label,
        amount: preset.amount,
      }]);
    }
  };

  const addCustomExtra = () => {
    if (!customExtraLabel.trim() || !customExtraAmount.trim()) {
      Alert.alert("Required", "Please enter extra name and amount");
      return;
    }
    const amount = parseFloat(customExtraAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid", "Please enter a valid amount");
      return;
    }
    setSelectedExtras([...selectedExtras, {
      id: generateId(),
      label: customExtraLabel.trim(),
      amount,
    }]);
    setCustomExtraLabel("");
    setCustomExtraAmount("");
  };

  const removeExtra = (extraId: string) => {
    setSelectedExtras(selectedExtras.filter(e => e.id !== extraId));
  };

  const saveItem = () => {
    if (!itemName.trim()) {
      Alert.alert("Required", "Please enter item name");
      return;
    }
    const basePrice = parseFloat(itemBasePrice);
    if (isNaN(basePrice) || basePrice <= 0) {
      Alert.alert("Invalid", "Please enter a valid base price");
      return;
    }
    const qty = parseInt(itemQty) || 1;

    const newItem: OrderItem = {
      id: editingItemId || generateId(),
      name: itemName.trim(),
      basePrice,
      quantity: qty,
      extras: selectedExtras,
      notes: itemNotes.trim() || undefined,
    };

    if (editingItemId) {
      setItems(items.map(i => i.id === editingItemId ? newItem : i));
    } else {
      setItems([...items, newItem]);
    }
    setShowItemModal(false);
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => setItems(items.filter(i => i.id !== itemId)) },
      ]
    );
  };

  const totalAmount = calculateOrderTotal(items);

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
    if (items.length === 0) {
      Alert.alert("Required", "Please add at least one item");
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    if (!selectedCustomer) {
      Alert.alert("Error", "Selected customer not found");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const orders = await getOrders();
        const existing = orders.find((o) => o.id === orderId);
        if (existing) {
          const order: Order = {
            id: orderId,
            customerId: selectedCustomerId,
            customerName: selectedCustomer.name,
            description: description.trim(),
            status: existing.status,
            amount: totalAmount,
            paidAmount: existing.paidAmount,
            dueDate: new Date(dueDate).toISOString(),
            createdAt: existing.createdAt,
            completedAt: existing.completedAt,
            deliveredAt: existing.deliveredAt,
            assignedEmployeeId: selectedEmployeeId || undefined,
            notes: notes.trim() || undefined,
            items,
          };
          await updateOrder(order);
          await updateCustomerBalance(selectedCustomerId);
          
          if (selectedEmployeeId && selectedEmployeeId !== existing.assignedEmployeeId) {
            await assignEmployeeToOrder(order.id, selectedEmployeeId);
          }
        }
      } else {
        const newOrderId = generateId();
        const order: Order = {
          id: newOrderId,
          customerId: selectedCustomerId,
          customerName: selectedCustomer.name,
          description: description.trim(),
          status: "pending",
          amount: totalAmount,
          paidAmount: 0,
          dueDate: new Date(dueDate).toISOString(),
          createdAt: new Date().toISOString(),
          assignedEmployeeId: selectedEmployeeId || undefined,
          notes: notes.trim() || undefined,
          items,
        };
        await addOrder(order);
        await updateCustomerBalance(selectedCustomerId);
        
        if (selectedEmployeeId) {
          await assignEmployeeToOrder(newOrderId, selectedEmployeeId);
        }
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentItemTotal = (() => {
    const base = parseFloat(itemBasePrice) || 0;
    const extrasSum = selectedExtras.reduce((sum, e) => sum + e.amount, 0);
    const qty = parseInt(itemQty) || 1;
    return (base + extrasSum) * qty;
  })();

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Customer
      </ThemedText>
      <Pressable
        style={[styles.picker, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        onPress={() => setShowCustomerPicker(!showCustomerPicker)}
      >
        {selectedCustomer ? (
          <View style={styles.selectedRow}>
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
        <View style={[styles.pickerList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          {customers.length === 0 ? (
            <ThemedText type="small" style={{ color: theme.textSecondary, padding: Spacing.lg }}>
              No customers available
            </ThemedText>
          ) : (
            customers.map((customer) => (
              <Pressable
                key={customer.id}
                style={[styles.pickerOption, selectedCustomerId === customer.id && { backgroundColor: theme.primary + "10" }]}
                onPress={() => { setSelectedCustomerId(customer.id); setShowCustomerPicker(false); }}
              >
                <ThemedText type="body">{customer.name}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>{customer.phone}</ThemedText>
              </Pressable>
            ))
          )}
        </View>
      ) : null}

      <ThemedText type="h4" style={styles.sectionTitle}>
        Assign Tailor
      </ThemedText>
      <Pressable
        style={[styles.picker, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        onPress={() => setShowEmployeePicker(!showEmployeePicker)}
      >
        {selectedEmployeeId ? (
          <View style={styles.selectedRow}>
            <View style={[styles.avatar, { backgroundColor: theme.accent + "20" }]}>
              <ThemedText type="body" style={{ color: theme.accent }}>
                {employees.find(e => e.id === selectedEmployeeId)?.name.charAt(0) || "?"}
              </ThemedText>
            </View>
            <View>
              <ThemedText type="body">{employees.find(e => e.id === selectedEmployeeId)?.name}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, textTransform: "capitalize" }}>
                {employees.find(e => e.id === selectedEmployeeId)?.role}
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderRow}>
            <Feather name="user-plus" size={18} color={theme.accent} />
            <ThemedText type="body" style={{ color: theme.textSecondary }}>Select a tailor (optional)</ThemedText>
          </View>
        )}
        <Feather name="chevron-down" size={20} color={theme.textSecondary} />
      </Pressable>

      {showEmployeePicker ? (
        <View style={[styles.pickerList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Pressable
            style={[styles.pickerOption, !selectedEmployeeId && { backgroundColor: theme.primary + "10" }]}
            onPress={() => { setSelectedEmployeeId(""); setShowEmployeePicker(false); }}
          >
            <ThemedText type="body" style={{ color: theme.textSecondary }}>No assignment</ThemedText>
          </Pressable>
          {employees.map((employee) => (
            <Pressable
              key={employee.id}
              style={[styles.pickerOption, selectedEmployeeId === employee.id && { backgroundColor: theme.accent + "10" }]}
              onPress={() => { setSelectedEmployeeId(employee.id); setShowEmployeePicker(false); }}
            >
              <ThemedText type="body">{employee.name}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary, textTransform: "capitalize" }}>
                {employee.role} - {employee.assignedOrders?.length || 0} orders
              </ThemedText>
            </Pressable>
          ))}
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
            placeholder="e.g., 2 Saree Blouses"
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

      <View style={styles.itemsHeader}>
        <ThemedText type="h4">Order Items</ThemedText>
        <Pressable style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={openAddItemModal}>
          <Feather name="plus" size={16} color="#FFFFFF" />
          <ThemedText type="caption" style={{ color: "#FFFFFF" }}>Add Item</ThemedText>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <View style={[styles.emptyItems, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="shopping-bag" size={32} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
            No items added yet
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Tap "Add Item" to add items with pricing
          </ThemedText>
        </View>
      ) : (
        <View style={{ gap: Spacing.md }}>
          {items.map((item) => (
            <Pressable key={item.id} style={[styles.itemCard, { backgroundColor: theme.backgroundDefault }]} onPress={() => openEditItemModal(item)}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>{item.name}</ThemedText>
                  {item.quantity > 1 ? (
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>Qty: {item.quantity}</ThemedText>
                  ) : null}
                </View>
                <Pressable onPress={() => removeItem(item.id)} hitSlop={8}>
                  <Feather name="trash-2" size={18} color={theme.error} />
                </Pressable>
              </View>
              <View style={styles.itemBreakdown}>
                <View style={styles.breakdownRow}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>Base Price</ThemedText>
                  <ThemedText type="caption">{formatCurrency(item.basePrice)}</ThemedText>
                </View>
                {item.extras?.map((extra) => (
                  <View key={extra.id} style={styles.breakdownRow}>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>+ {extra.label}</ThemedText>
                    <ThemedText type="caption">{formatCurrency(extra.amount)}</ThemedText>
                  </View>
                ))}
                <View style={[styles.divider, { backgroundColor: theme.border, marginVertical: Spacing.xs }]} />
                <View style={styles.breakdownRow}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>Item Total</ThemedText>
                  <ThemedText type="body" style={{ fontWeight: "600", color: theme.primary }}>
                    {formatCurrency(calculateItemTotal(item))}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {items.length > 0 ? (
        <View style={[styles.grandTotal, { backgroundColor: theme.primary + "10" }]}>
          <ThemedText type="h4">Grand Total</ThemedText>
          <ThemedText type="h2" style={{ color: theme.primary }}>{formatCurrency(totalAmount)}</ThemedText>
        </View>
      ) : null}

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
          textAlignVertical="top"
        />
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: loading ? theme.textSecondary : theme.primary }]}
        onPress={handleSave}
        disabled={loading}
      >
        <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
          {loading ? "Saving..." : isEditing ? "Update Order" : "Create Order"}
        </ThemedText>
      </Pressable>

      <Modal visible={showItemModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
            <View style={styles.modalHeader}>
              <ThemedText type="h3">{editingItemId ? "Edit Item" : "Add Item"}</ThemedText>
              <Pressable onPress={() => setShowItemModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.inputGroup, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={styles.inputRow}>
                  <ThemedText type="body">Item Name *</ThemedText>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="e.g., Saree Blouse"
                    placeholderTextColor={theme.textSecondary}
                    value={itemName}
                    onChangeText={setItemName}
                  />
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.inputRow}>
                  <ThemedText type="body">Base Price *</ThemedText>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="e.g., 500"
                    placeholderTextColor={theme.textSecondary}
                    value={itemBasePrice}
                    onChangeText={setItemBasePrice}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.inputRow}>
                  <ThemedText type="body">Quantity</ThemedText>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="1"
                    placeholderTextColor={theme.textSecondary}
                    value={itemQty}
                    onChangeText={setItemQty}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <ThemedText type="h4" style={styles.sectionTitle}>
                Add-ons / Extras
              </ThemedText>
              <View style={styles.extrasChips}>
                {extrasPresets.map((preset) => {
                  const isSelected = selectedExtras.some(e => e.label === preset.label);
                  return (
                    <Pressable
                      key={preset.id}
                      style={[
                        styles.chip,
                        { borderColor: isSelected ? theme.accent : theme.border },
                        isSelected && { backgroundColor: theme.accent + "15" },
                      ]}
                      onPress={() => toggleExtra(preset)}
                    >
                      <ThemedText type="caption" style={{ color: isSelected ? theme.accent : theme.text }}>
                        {preset.label} (+{formatCurrency(preset.amount)})
                      </ThemedText>
                      {isSelected ? <Feather name="check" size={14} color={theme.accent} /> : null}
                    </Pressable>
                  );
                })}
              </View>

              <ThemedText type="body" style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}>
                Custom Extra
              </ThemedText>
              <View style={styles.customExtraRow}>
                <TextInput
                  style={[styles.customExtraInput, { color: theme.text, borderColor: theme.border, flex: 2 }]}
                  placeholder="Name"
                  placeholderTextColor={theme.textSecondary}
                  value={customExtraLabel}
                  onChangeText={setCustomExtraLabel}
                />
                <TextInput
                  style={[styles.customExtraInput, { color: theme.text, borderColor: theme.border, flex: 1 }]}
                  placeholder="Amount"
                  placeholderTextColor={theme.textSecondary}
                  value={customExtraAmount}
                  onChangeText={setCustomExtraAmount}
                  keyboardType="decimal-pad"
                />
                <Pressable style={[styles.addExtraBtn, { backgroundColor: theme.accent }]} onPress={addCustomExtra}>
                  <Feather name="plus" size={18} color="#FFFFFF" />
                </Pressable>
              </View>

              {selectedExtras.length > 0 ? (
                <View style={[styles.selectedExtras, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                    Selected Extras:
                  </ThemedText>
                  {selectedExtras.map((extra) => (
                    <View key={extra.id} style={styles.selectedExtraRow}>
                      <ThemedText type="body">{extra.label}</ThemedText>
                      <View style={styles.selectedExtraRight}>
                        <ThemedText type="body">{formatCurrency(extra.amount)}</ThemedText>
                        <Pressable onPress={() => removeExtra(extra.id)} hitSlop={8}>
                          <Feather name="x-circle" size={18} color={theme.error} />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.inputRow}>
                <ThemedText type="body">Item Notes</ThemedText>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Optional notes for this item"
                  placeholderTextColor={theme.textSecondary}
                  value={itemNotes}
                  onChangeText={setItemNotes}
                />
              </View>

              <View style={[styles.itemPreview, { backgroundColor: theme.primary + "10" }]}>
                <ThemedText type="h4">Item Total</ThemedText>
                <ThemedText type="h2" style={{ color: theme.primary }}>{formatCurrency(currentItemTotal)}</ThemedText>
              </View>
            </ScrollView>

            <Pressable style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]} onPress={saveItem}>
              <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                {editingItemId ? "Update Item" : "Add Item"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  placeholderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerList: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    maxHeight: 200,
    overflow: "hidden",
  },
  pickerOption: {
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
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  emptyItems: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
  itemCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  itemBreakdown: {
    gap: Spacing.xs,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  notesInput: {
    fontSize: 16,
    padding: Spacing.lg,
    minHeight: 100,
  },
  saveButton: {
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "90%",
    paddingTop: Spacing.sm,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.sm,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  modalScroll: {
    paddingHorizontal: Spacing.lg,
  },
  extrasChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  customExtraRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  customExtraInput: {
    fontSize: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
  },
  addExtraBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedExtras: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  selectedExtraRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  selectedExtraRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  itemPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  modalSaveBtn: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
