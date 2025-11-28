import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  getUserName,
  setUserName,
  getShopName,
  setShopName,
  clearAllData,
} from "@/utils/storage";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [userName, setUserNameState] = useState("");
  const [shopName, setShopNameState] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const name = await getUserName();
    const shop = await getShopName();
    setUserNameState(name);
    setShopNameState(shop);
  };

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
            Alert.alert("Done", "All data has been cleared");
          },
        },
      ]
    );
  };

  return (
    <ScreenScrollView>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Profile
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.inputRow}>
          <ThemedText type="body">Your Name</ThemedText>
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
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
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
          <ThemedText type="body">Build</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            2024.1
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Data Management
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <Pressable
          style={({ pressed }) => [styles.dangerRow, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleClearData}
        >
          <Feather name="trash-2" size={20} color={theme.error} />
          <View style={styles.dangerContent}>
            <ThemedText type="body" style={{ color: theme.error }}>
              Clear All Data
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Delete all customers, orders, and payments
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.error} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          TailorFlow - Tailoring Business Management
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Crafted with precision for tailoring professionals
        </ThemedText>
      </View>
    </ScreenScrollView>
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
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  dangerContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  footer: {
    marginTop: Spacing["3xl"],
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
});
