import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, Shadows } from "@/constants/theme";
import { EmployeesStackParamList } from "@/navigation/EmployeesStackNavigator";
import { useData } from "@/contexts/DataContext";
import { Employee } from "@/types";

const ROLES: { key: Employee["role"]; label: string; icon: keyof typeof Feather.glyphMap; colors: [string, string] }[] = [
  { key: "tailor", label: "Tailor", icon: "scissors", colors: ["#F2994A", "#F2C94C"] },
  { key: "manager", label: "Manager", icon: "user-check", colors: ["#4FACFE", "#00F2FE"] },
  { key: "admin", label: "Admin", icon: "shield", colors: ["#667EEA", "#764BA2"] },
];

export default function AddEmployeeScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<EmployeesStackParamList, "AddEmployee">>();
  const { getEmployees, addEmployee, updateEmployee } = useData();
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
    const employee = employees.find((e: Employee) => e.id === employeeId);
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
      if (isEditing) {
        const employees = await getEmployees();
        const existing = employees.find((e: Employee) => e.id === employeeId);
        if (existing) {
          await updateEmployee({
            ...existing,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            role,
          });
        }
      } else {
        await addEmployee({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          role,
          assignedOrders: [],
          isActive: true,
        });
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
      <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
      <View style={[styles.card, Shadows.level1]}>
        <View style={styles.inputRow}>
          <ThemedText style={styles.label}>Name *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter employee name"
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
      </View>

      <ThemedText style={styles.sectionTitle}>Role</ThemedText>
      <View style={styles.roleContainer}>
        {ROLES.map((r) => (
          <Pressable
            key={r.key}
            style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => setRole(r.key)}
          >
            {role === r.key ? (
              <LinearGradient
                colors={r.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.roleOption, Shadows.level1]}
              >
                <Feather name={r.icon} size={24} color="#FFFFFF" />
                <ThemedText style={styles.roleTextActive}>{r.label}</ThemedText>
              </LinearGradient>
            ) : (
              <View style={[styles.roleOption, styles.roleOptionInactive, Shadows.level1]}>
                <Feather name={r.icon} size={24} color="#8E8E93" />
                <ThemedText style={styles.roleTextInactive}>{r.label}</ThemedText>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [{ opacity: pressed || loading ? 0.8 : 1, marginTop: Spacing.xl, marginBottom: Spacing.xl }]}
        onPress={handleSave}
        disabled={loading}
      >
        <LinearGradient
          colors={["#0BA360", "#3CBA92"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveButton}
        >
          <Feather name={isEditing ? "check" : "user-plus"} size={20} color="#FFFFFF" />
          <ThemedText style={styles.saveText}>
            {loading ? "Saving..." : isEditing ? "Update Employee" : "Add Employee"}
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
  roleContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleOption: {
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    gap: Spacing.sm,
  },
  roleOptionInactive: {
    backgroundColor: "#FFFFFF",
  },
  roleTextActive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  roleTextInactive: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
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
