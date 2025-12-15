import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MoreStackParamList } from "@/navigation/MoreStackNavigator";
import { withOpacity } from "@/utils/colorUtils";

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  screen: keyof MoreStackParamList;
  color?: string;
}

export default function MoreScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();

  const financialItems: MenuItem[] = [
    {
      icon: "credit-card",
      title: "Payments",
      subtitle: "Manage invoices and payments",
      screen: "Payments",
    },
    {
      icon: "bar-chart-2",
      title: "Analytics",
      subtitle: "View business insights",
      screen: "Analytics",
    },
  ];

  const toolsItems: MenuItem[] = [
    {
      icon: "scissors",
      title: "Pattern Engine",
      subtitle: "Generate garment patterns",
      screen: "PatternTemplates",
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      icon: "settings",
      title: "Settings",
      subtitle: "App preferences and account",
      screen: "Settings",
    },
  ];

  const renderMenuItem = (item: MenuItem, isLast: boolean) => (
    <Pressable
      key={item.screen}
      style={({ pressed }) => [
        styles.menuItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border },
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={[styles.menuIcon, { backgroundColor: withOpacity(item.color || theme.primary, 0.12) }]}>
        <Feather name={item.icon as any} size={20} color={item.color || theme.primary} />
      </View>
      <View style={styles.menuContent}>
        <ThemedText type="body">{item.title}</ThemedText>
        {item.subtitle ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {item.subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );

  return (
    <ScreenScrollView>
      <ThemedText type="h4" style={styles.sectionTitle}>
        Financial
      </ThemedText>
      <View style={[styles.menuCard, { backgroundColor: theme.backgroundDefault }]}>
        {financialItems.map((item, index) =>
          renderMenuItem(item, index === financialItems.length - 1)
        )}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Tools
      </ThemedText>
      <View style={[styles.menuCard, { backgroundColor: theme.backgroundDefault }]}>
        {toolsItems.map((item, index) =>
          renderMenuItem(item, index === toolsItems.length - 1)
        )}
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        Account
      </ThemedText>
      <View style={[styles.menuCard, { backgroundColor: theme.backgroundDefault }]}>
        {settingsItems.map((item, index) =>
          renderMenuItem(item, index === settingsItems.length - 1)
        )}
      </View>

      <View style={styles.appInfo}>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          TailorFlow v1.0.0
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
  menuCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  appInfo: {
    marginTop: Spacing["3xl"],
    gap: Spacing.xs,
  },
});
