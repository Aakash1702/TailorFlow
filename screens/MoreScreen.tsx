import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, Shadows } from "@/constants/theme";
import { MoreStackParamList } from "@/navigation/MoreStackNavigator";

interface MenuItem {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  screen: keyof MoreStackParamList;
  gradientColors: [string, string];
}

export default function MoreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();

  const financialItems: MenuItem[] = [
    {
      icon: "credit-card",
      title: "Payments",
      subtitle: "Manage invoices and payments",
      screen: "Payments",
      gradientColors: ["#FA709A", "#FEE140"],
    },
    {
      icon: "pie-chart",
      title: "Analytics",
      subtitle: "View business insights",
      screen: "Analytics",
      gradientColors: ["#2193B0", "#6DD5ED"],
    },
  ];

  const toolsItems: MenuItem[] = [
    {
      icon: "scissors",
      title: "Pattern Engine",
      subtitle: "Generate garment patterns",
      screen: "PatternTemplates",
      gradientColors: ["#667EEA", "#764BA2"],
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      icon: "sliders",
      title: "Settings",
      subtitle: "App preferences and account",
      screen: "Settings",
      gradientColors: ["#A18CD1", "#FBC2EB"],
    },
  ];

  const renderMenuItem = (item: MenuItem, isLast: boolean) => (
    <Pressable
      key={item.screen}
      style={({ pressed }) => [
        styles.menuItem,
        !isLast && styles.menuItemBorder,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <LinearGradient
        colors={item.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.menuIcon}
      >
        <Feather name={item.icon} size={20} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.menuContent}>
        <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
        {item.subtitle ? (
          <ThemedText style={styles.menuSubtitle}>{item.subtitle}</ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color="#C7C7CC" />
    </Pressable>
  );

  return (
    <ScreenScrollView>
      <ThemedText style={styles.sectionTitle}>Financial</ThemedText>
      <View style={[styles.menuCard, Shadows.level1]}>
        {financialItems.map((item, index) =>
          renderMenuItem(item, index === financialItems.length - 1)
        )}
      </View>

      <ThemedText style={styles.sectionTitle}>Tools</ThemedText>
      <View style={[styles.menuCard, Shadows.level1]}>
        {toolsItems.map((item, index) =>
          renderMenuItem(item, index === toolsItems.length - 1)
        )}
      </View>

      <ThemedText style={styles.sectionTitle}>Account</ThemedText>
      <View style={[styles.menuCard, Shadows.level1]}>
        {settingsItems.map((item, index) =>
          renderMenuItem(item, index === settingsItems.length - 1)
        )}
      </View>

      <View style={styles.appInfo}>
        <ThemedText style={styles.appVersion}>TailorFlow v1.0.0</ThemedText>
        <ThemedText style={styles.appTagline}>
          Crafted with precision for tailoring professionals
        </ThemedText>
      </View>
    </ScreenScrollView>
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
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  appInfo: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.xl,
    gap: 4,
  },
  appVersion: {
    fontSize: 13,
    color: "#8E8E93",
  },
  appTagline: {
    fontSize: 13,
    color: "#C7C7CC",
    textAlign: "center",
  },
});
