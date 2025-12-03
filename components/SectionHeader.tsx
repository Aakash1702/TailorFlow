import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  style,
}: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <ThemedText type="h3">{title}</ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <ThemedText type="smallMedium" style={{ color: theme.primary }}>
            {actionLabel}
          </ThemedText>
          <Feather name="chevron-right" size={16} color={theme.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
