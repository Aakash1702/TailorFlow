import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { EmployeesStackParamList } from "@/navigation/EmployeesStackNavigator";
import { getEmployees, addEmployee, updateEmployee, generateId } from "@/utils/storage";
import { Employee } from "@/types";

const ROLES: { key: Employee["role"]; label: string }[] = [
  { key: "tailor", label: "Tailor" },
  { key: "manager", label: "Manager" },
  { key: "admin", label: "Admin" },
];

export default function AddEmployeeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<EmployeesStackParamList, "AddEmployee">>();
  const employeeId = route.params?.employeeId;
  const isEditing = !!employeeId;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Employee["role"]>("tailor");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    const employees = await getEmployees();
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      setName(employee.name);
      setPhone(employee.phone);
      setEmail(employee.email || "");
      setRole(employee.role);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter employee name");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Required", "Please enter phone number");
      return;
    }

    setLoading(true);
    try {
      const employee: Employee = {
        id: employeeId || generateId(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        role,
        assignedOrders: [],
        joinedAt: new Date().toISOString(),
        isActive: true,
      };

      if (isEditing) {
        const employees = await getEmployees();
        const existing = employees.find((e) => e.id === employeeId);
        if (existing) {
          employee.assignedOrders = existing.assignedOrders;
          employee.joinedAt = existing.joinedAt;
          employee.isActive = existing.isActive;
        }
        await updateEmployee(employee);
      } else {
        await addEmployee(employee);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Basic Information
      </ThemedText>
      <View style={[styles.inputGroup, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.inputRow}>
          <ThemedText type="body">Name *</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Enter employee name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.inputRow}>
          <ThemedText type="body">Phone *</ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text }]}
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
            style={[styles.input, { color: theme.text }]}
            placeholder="Enter email address"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Role
      </ThemedText>
      <View style={styles.roleContainer}>
        {ROLES.map((r) => (
          <Pressable
            key={r.key}
            style={[
              styles.roleOption,
              {
                backgroundColor: role === r.key ? theme.primary : theme.backgroundDefault,
                borderColor: role === r.key ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setRole(r.key)}
          >
            <Feather
              name={r.key === "admin" ? "shield" : r.key === "manager" ? "user-check" : "scissors"}
              size={20}
              color={role === r.key ? "#FFFFFF" : theme.text}
            />
            <ThemedText
              type="body"
              style={{ color: role === r.key ? "#FFFFFF" : theme.text }}
            >
              {r.label}
            </ThemedText>
          </Pressable>
        ))}
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
          {loading ? "Saving..." : isEditing ? "Update Employee" : "Add Employee"}
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
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  roleContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  saveButton: {
    marginTop: Spacing["2xl"],
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
