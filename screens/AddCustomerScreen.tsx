import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, Shadows } from "@/constants/theme";
import { CustomersStackParamList } from "@/navigation/CustomersStackNavigator";
import { useData } from "@/contexts/DataContext";
import { Customer, Measurements } from "@/types";

export default function AddCustomerScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<CustomersStackParamList, "AddCustomer">>();
  const { getCustomers, addCustomer, updateCustomer } = useData();
  const customerId = route.params?.customerId;
  const isEditing = !!customerId;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

  const loadCustomer = async () => {
    const customers = await getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || "");
      setAddress(customer.address || "");
      setNotes(customer.notes || "");
      setMeasurements(customer.measurements);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter customer name");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Required", "Please enter phone number");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && customerId) {
        const customers = await getCustomers();
        const existing = customers.find((c) => c.id === customerId);
        if (existing) {
          const customer: Customer = {
            ...existing,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            address: address.trim() || undefined,
            notes: notes.trim() || undefined,
            measurements,
          };
          await updateCustomer(customer);
        }
      } else {
        await addCustomer({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
          measurements,
          outstandingBalance: 0,
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save customer:', error);
      Alert.alert("Error", "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  const updateMeasurement = (key: keyof Measurements, value: string) => {
    const numValue = parseFloat(value);
    setMeasurements((prev) => ({
      ...prev,
      [key]: isNaN(numValue) ? undefined : numValue,
    }));
  };

  const measurementFields: { key: keyof Measurements; label: string }[] = [
    { key: "chest", label: "Chest" },
    { key: "waist", label: "Waist" },
    { key: "hips", label: "Hips" },
    { key: "shoulder", label: "Shoulder" },
    { key: "sleeveLength", label: "Sleeve Length" },
    { key: "neck", label: "Neck" },
    { key: "back", label: "Back" },
    { key: "inseam", label: "Inseam" },
    { key: "outseam", label: "Outseam" },
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
      <View style={[styles.card, Shadows.level1]}>
        <View style={styles.inputRow}>
          <ThemedText style={styles.label}>Name *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter customer name"
            placeholderTextColor="#8E8E93"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.inputRow}>
          <ThemedText style={styles.label}>Phone *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor="#8E8E93"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.inputRow}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.inputRow}>
          <ThemedText style={styles.label}>Address</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter address"
            placeholderTextColor="#8E8E93"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>
      </View>

      <ThemedText style={styles.sectionTitle}>Measurements (inches)</ThemedText>
      <View style={[styles.card, Shadows.level1]}>
        {measurementFields.map((field, index) => (
          <View key={field.key}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.measurementRow}>
              <ThemedText style={styles.measurementLabel}>{field.label}</ThemedText>
              <TextInput
                style={styles.measurementInput}
                placeholder="0"
                placeholderTextColor="#C7C7CC"
                value={measurements[field.key]?.toString() || ""}
                onChangeText={(value) => updateMeasurement(field.key, value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        ))}
      </View>

      <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
      <View style={[styles.card, Shadows.level1]}>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any notes about this customer..."
          placeholderTextColor="#8E8E93"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <Pressable
        style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1, marginTop: Spacing.xl, marginBottom: Spacing.xl }]}
        onPress={handleSave}
        disabled={loading}
      >
        <LinearGradient
          colors={["#FF758C", "#FF7EB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveButton}
        >
          <Feather name={isEditing ? "check" : "user-plus"} size={20} color="#FFFFFF" />
          <ThemedText style={styles.saveText}>
            {loading ? "Saving..." : isEditing ? "Update Customer" : "Add Customer"}
          </ThemedText>
        </LinearGradient>
      </Pressable>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  inputRow: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  label: {
    fontSize: 13,
    color: "#8E8E93",
  },
  input: {
    fontSize: 17,
    color: "#1C1C1E",
    padding: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginHorizontal: Spacing.lg,
  },
  measurementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  measurementLabel: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  measurementInput: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "right",
    width: 80,
    padding: Spacing.sm,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  notesInput: {
    fontSize: 16,
    color: "#1C1C1E",
    padding: Spacing.lg,
    minHeight: 100,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  saveText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
