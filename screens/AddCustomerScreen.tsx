import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { CustomersStackParamList } from "@/navigation/CustomersStackNavigator";
import { useData } from "@/contexts/DataContext";
import { Customer, Measurements } from "@/types";

export default function AddCustomerScreen() {
  const { theme } = useTheme();
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
      <ThemedText type="h4" style={styles.sectionTitle}>
        Basic Information
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.inputRow}>
          <ThemedText type="body">Name *</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Enter customer name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.inputRow}>
          <ThemedText type="body">Phone *</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Enter phone number"
            placeholderTextColor={theme.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.inputRow}>
          <ThemedText type="body">Email</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Enter email address"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.inputRow}>
          <ThemedText type="body">Address</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="Enter address"
            placeholderTextColor={theme.textSecondary}
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Measurements (inches)
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        {measurementFields.map((field, index) => (
          <React.Fragment key={field.key}>
            <View style={styles.measurementRow}>
              <ThemedText type="body">{field.label}</ThemedText>
              <TextInput
                style={[styles.measurementInput, { color: theme.text, borderColor: theme.border }]}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                value={measurements[field.key]?.toString() || ""}
                onChangeText={(v) => updateMeasurement(field.key, v)}
                keyboardType="decimal-pad"
              />
            </View>
            {index < measurementFields.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Notes
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        <TextInput
          style={[styles.notesInput, { color: theme.text }]}
          placeholder="Add any notes about this customer..."
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
          {loading ? "Saving..." : isEditing ? "Update Customer" : "Add Customer"}
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
  measurementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  measurementInput: {
    fontSize: 16,
    textAlign: "right",
    minWidth: 60,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
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
