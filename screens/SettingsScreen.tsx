import React, { useState, useCallback } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Share, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, Shadows } from "@/constants/theme";
import {
  setUserName,
  setShopName,
  clearAllData,
  formatCurrency,
} from "@/utils/storage";

const STAT_CONFIG = [
  { title: "Customers", icon: "users" as const, colors: ["#FF758C", "#FF7EB3"] as [string, string] },
  { title: "Orders", icon: "package" as const, colors: ["#4FACFE", "#00F2FE"] as [string, string] },
  { title: "Employees", icon: "user-check" as const, colors: ["#0BA360", "#3CBA92"] as [string, string] },
  { title: "Revenue", icon: "trending-up" as const, colors: ["#11998E", "#38EF7D"] as [string, string] },
];

export default function SettingsScreen() {
  const { getCustomers, getOrders, getEmployees, getPayments, getUserName, getShopName } = useData();
  const { signOut, user, session, profile, shop } = useAuth();
  const [userName, setUserNameState] = useState("");
  const [shopName, setShopNameState] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    employees: 0,
    revenue: 0,
  });

  const loadSettings = useCallback(async () => {
    const name = await getUserName();
    const shopNameValue = await getShopName();
    setUserNameState(name);
    setShopNameState(shopNameValue);

    const customers = await getCustomers();
    const orders = await getOrders();
    const employees = await getEmployees();
    const payments = await getPayments();
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    setStats({
      customers: customers.length,
      orders: orders.length,
      employees: employees.length,
      revenue: totalRevenue,
    });
  }, [getCustomers, getOrders, getEmployees, getPayments, getUserName, getShopName]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await setUserName(userName);
      await setShopName(shopName);
      setIsEditing(false);
      Alert.alert("Success", "Settings saved successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const customers = await getCustomers();
      const orders = await getOrders();
      const employees = await getEmployees();
      const payments = await getPayments();

      const exportData = {
        exportDate: new Date().toISOString(),
        shopName,
        data: { customers, orders, employees, payments },
        summary: {
          totalCustomers: customers.length,
          totalOrders: orders.length,
          totalEmployees: employees.length,
          totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      if (Platform.OS === "web") {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tailorflow-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert("Export Complete", "Data has been downloaded");
      } else {
        await Share.share({
          message: jsonString,
          title: "TailorFlow Data Export",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all customers, orders, employees, payments, and settings. This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            setUserNameState("");
            setShopNameState("TailorFlow");
            await loadSettings();
            Alert.alert("Done", "All data has been cleared");
          },
        },
      ]
    );
  };

  const statValues = [
    stats.customers.toString(),
    stats.orders.toString(),
    stats.employees.toString(),
    formatCurrency(stats.revenue),
  ];

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText style={styles.sectionTitle}>Shop Profile</ThemedText>
      <View style={[styles.card, Shadows.level1]}>
        <View style={styles.inputRow}>
          <ThemedText style={styles.label}>Shop Name</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="Enter shop name"
              placeholderTextColor="#8E8E93"
              value={shopName}
              onChangeText={setShopNameState}
            />
          ) : (
            <ThemedText style={styles.value}>{shopName || "TailorFlow"}</ThemedText>
          )}
        </View>
        <View style={styles.divider} />
        <View style={styles.inputRow}>
          <ThemedText style={styles.label}>Owner Name</ThemedText>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#8E8E93"
              value={userName}
              onChangeText={setUserNameState}
            />
          ) : (
            <ThemedText style={styles.value}>{userName || "Not set"}</ThemedText>
          )}
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editActions}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => {
              setIsEditing(false);
              loadSettings();
            }}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed || saving ? 0.8 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={["#667EEA", "#764BA2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              <ThemedText style={styles.saveText}>
                {saving ? "Saving..." : "Save"}
              </ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, marginTop: Spacing.lg }]}
          onPress={() => setIsEditing(true)}
        >
          <LinearGradient
            colors={["#667EEA", "#764BA2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.editButton}
          >
            <Feather name="edit-2" size={18} color="#FFFFFF" />
            <ThemedText style={styles.editText}>Edit Profile</ThemedText>
          </LinearGradient>
        </Pressable>
      )}

      <ThemedText style={styles.sectionTitle}>Data Summary</ThemedText>
      <View style={styles.statsGrid}>
        {STAT_CONFIG.map((stat, index) => (
          <LinearGradient
            key={stat.title}
            colors={stat.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.statCard, Shadows.level1]}
          >
            <Feather name={stat.icon} size={20} color="#FFFFFF" />
            <ThemedText style={styles.statValue}>{statValues[index]}</ThemedText>
            <ThemedText style={styles.statLabel}>{stat.title}</ThemedText>
          </LinearGradient>
        ))}
      </View>

      <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>
      <View style={[styles.card, Shadows.level1]}>
        <Pressable
          style={({ pressed }) => [styles.actionRow, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleExportData}
        >
          <LinearGradient
            colors={["#4FACFE", "#00F2FE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionIcon}
          >
            <Feather name="download" size={18} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.actionContent}>
            <ThemedText style={styles.actionTitle}>Export Data</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Download all data as JSON backup</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#C7C7CC" />
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          style={({ pressed }) => [styles.actionRow, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleClearData}
        >
          <LinearGradient
            colors={["#FF758C", "#FF7EB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionIcon}
          >
            <Feather name="trash-2" size={18} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.actionContent}>
            <ThemedText style={[styles.actionTitle, { color: "#DC2626" }]}>Clear All Data</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Delete all customers, orders, and payments</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color="#C7C7CC" />
        </Pressable>
      </View>

      <ThemedText style={styles.sectionTitle}>About</ThemedText>
      <View style={[styles.card, Shadows.level1]}>
        <View style={styles.aboutRow}>
          <ThemedText style={styles.aboutLabel}>Version</ThemedText>
          <ThemedText style={styles.aboutValue}>1.0.0</ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.aboutRow}>
          <ThemedText style={styles.aboutLabel}>Platform</ThemedText>
          <ThemedText style={styles.aboutValue}>
            {Platform.OS === "web" ? "Web" : Platform.OS === "ios" ? "iOS" : "Android"}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.sectionTitle}>Account</ThemedText>
      <View style={[styles.card, Shadows.level1]}>
        {session?.user?.email || user?.email || profile?.email ? (
          <>
            <View style={styles.aboutRow}>
              <ThemedText style={styles.aboutLabel}>Signed in as</ThemedText>
              <ThemedText style={[styles.aboutValue, { flex: 1, textAlign: "right" }]} numberOfLines={1}>
                {session?.user?.email || user?.email || profile?.email}
              </ThemedText>
            </View>
            {profile?.full_name ? (
              <>
                <View style={styles.divider} />
                <View style={styles.aboutRow}>
                  <ThemedText style={styles.aboutLabel}>Name</ThemedText>
                  <ThemedText style={styles.aboutValue}>{profile.full_name}</ThemedText>
                </View>
              </>
            ) : null}
            {shop?.name ? (
              <>
                <View style={styles.divider} />
                <View style={styles.aboutRow}>
                  <ThemedText style={styles.aboutLabel}>Shop</ThemedText>
                  <ThemedText style={styles.aboutValue}>{shop.name}</ThemedText>
                </View>
              </>
            ) : null}
            <View style={styles.divider} />
            <Pressable
              style={({ pressed }) => [styles.actionRow, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => {
                Alert.alert(
                  "Sign Out",
                  "Are you sure you want to sign out?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Sign Out",
                      style: "destructive",
                      onPress: async () => {
                        await signOut();
                      },
                    },
                  ]
                );
              }}
            >
              <LinearGradient
                colors={["#FF758C", "#FF7EB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIcon}
              >
                <Feather name="log-out" size={18} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.actionContent}>
                <ThemedText style={[styles.actionTitle, { color: "#DC2626" }]}>Sign Out</ThemedText>
                <ThemedText style={styles.actionSubtitle}>Sign out of your account</ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color="#C7C7CC" />
            </Pressable>
          </>
        ) : (
          <View style={styles.aboutRow}>
            <ThemedText style={styles.aboutValue}>Not signed in</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>TailorFlow - Tailoring Business Management</ThemedText>
        <ThemedText style={styles.footerSubtext}>Crafted with precision for tailoring professionals</ThemedText>
      </View>
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
    padding: 0,
    color: "#1C1C1E",
  },
  value: {
    fontSize: 17,
    color: "#1C1C1E",
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F7",
    marginHorizontal: Spacing.lg,
  },
  editActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  saveButton: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  editText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47%",
    flexGrow: 1,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  aboutLabel: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  aboutValue: {
    fontSize: 16,
    color: "#8E8E93",
  },
  footer: {
    marginTop: Spacing["3xl"],
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
  },
  footerSubtext: {
    fontSize: 13,
    color: "#C7C7CC",
    textAlign: "center",
  },
});
