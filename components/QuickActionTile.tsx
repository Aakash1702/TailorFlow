import React from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AnimatedPressable } from "./AnimatedPressable";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface QuickActionTileProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
}

export function QuickActionTile({
  title,
  icon,
  onPress,
  style,
  iconColor,
}: QuickActionTileProps) {
  const { theme } = useTheme();
  const color = iconColor || theme.primary;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.borderLight,
        },
        style,
      ]}
      scaleValue={0.96}
      opacityValue={0.9}
    >
      <Feather name={icon} size={26} color={color} />
      <ThemedText type="smallMedium" style={styles.title}>
        {title}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "31%",
    flexGrow: 1,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    textAlign: "center",
  },
});
