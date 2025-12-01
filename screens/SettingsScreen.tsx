import React, { useState, useCallback } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, Share, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  setUserName,
  setShopName,
  clearAllData,
  formatCurrency,
} from "@/utils/storage";

export default function SettingsScreen() {
  const { theme } = useTheme();
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

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Shop Profile
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.inputRow}>
          <ThemedText type="body">Shop Name</ThemedText>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter shop name"
              placeholderTextColor={theme.textSecondary}
              value={shopName}
              onChangeText={setShopNameState}
            />
          ) : (
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {shopName || "TailorFlow"}
            </ThemedText>
          )}
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.inputRow}>
          <ThemedText type="body">Owner Name</ThemedText>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              value={userName}
              onChangeText={setUserNameState}
            />
          ) : (
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {userName || "Not set"}
            </ThemedText>
          )}
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editActions}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              { borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => {
              setIsEditing(false);
              loadSettings();
            }}
          >
            <ThemedText type="body">Cancel</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: theme.primary, opacity: pressed || saving ? 0.8 : 1 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
              {saving ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => setIsEditing(true)}
        >
          <Feather name="edit-2" size={18} color="#FFFFFF" />
          <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>
            Edit Profile
          </ThemedText>
        </Pressable>
      )}

      <ThemedText type="h4" style={styles.sectionTitle}>
        Data Summary
      </ThemedText>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="users" size={20} color={theme.primary} />
          <ThemedText type="h3" style={{ color: theme.primary }}>
            {stats.customers}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Customers
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="shopping-bag" size={20} color={theme.info} />
          <ThemedText type="h3" style={{ color: theme.info }}>
            {stats.orders}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Orders
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="briefcase" size={20} color={theme.accent} />
          <ThemedText type="h3" style={{ color: theme.accent }}>
            {stats.employees}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Employees
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="trending-up" size={20} color={theme.completed} />
          <ThemedText type="h3" style={{ color: theme.completed }}>
            {formatCurrency(stats.revenue)}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Revenue
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Data Management
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <Pressable
          style={({ pressed }) => [styles.actionRow, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleExportData}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.info + "15" }]}>
            <Feather name="download" size={18} color={theme.info} />
          </View>
          <View style={styles.actionContent}>
            <ThemedText type="body">Export Data</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Download all data as JSON backup
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Pressable
          style={({ pressed }) => [styles.actionRow, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleClearData}
        >
          <View style={[styles.actionIcon, { backgroundColor: theme.error + "15" }]}>
            <Feather name="trash-2" size={18} color={theme.error} />
          </View>
          <View style={styles.actionContent}>
            <ThemedText type="body" style={{ color: theme.error }}>
              Clear All Data
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Delete all customers, orders, and payments
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        About
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.aboutRow}>
          <ThemedText type="body">Version</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            1.0.0
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.aboutRow}>
          <ThemedText type="body">Platform</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {Platform.OS === "web" ? "Web" : Platform.OS === "ios" ? "iOS" : "Android"}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Account
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        {session?.user?.email || user?.email || profile?.email ? (
          <>
            <View style={styles.aboutRow}>
              <ThemedText type="body">Signed in as</ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1, textAlign: "right" }} numberOfLines={1}>
                {session?.user?.email || user?.email || profile?.email}
              </ThemedText>
            </View>
            {profile?.full_name ? (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.aboutRow}>
                  <ThemedText type="body">Name</ThemedText>
                  <ThemedText type="body" style={{ color: theme.textSecondary }}>
                    {profile.full_name}
                  </ThemedText>
                </View>
              </>
            ) : null}
            {shop?.name ? (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.aboutRow}>
                  <ThemedText type="body">Shop</ThemedText>
                  <ThemedText type="body" style={{ color: theme.textSecondary }}>
                    {shop.name}
                  </ThemedText>
                </View>
              </>
            ) : null}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
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
              <View style={[styles.actionIcon, { backgroundColor: theme.error + "15" }]}>
                <Feather name="log-out" size={18} color={theme.error} />
              </View>
              <View style={styles.actionContent}>
                <ThemedText type="body" style={{ color: theme.error }}>
                  Sign Out
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Sign out of your account
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          </>
        ) : (
          <View style={styles.aboutRow}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Not signed in
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          TailorFlow - Tailoring Business Management
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Crafted with precision for tailoring professionals
        </ThemedText>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  card: {
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
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  divider: {
    height: 1,
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
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
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  footer: {
    marginTop: Spacing["3xl"],
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
});
