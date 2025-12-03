import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AnimatedPressable } from "./AnimatedPressable";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { withOpacity } from "@/utils/colorUtils";

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({
  title,
  value,
  icon,
  color,
  onPress,
  style,
}: StatCardProps) {
  const { theme } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        style,
      ]}
      scaleValue={0.98}
      opacityValue={0.95}
    >
      <View
        style={[
          styles.gradientOverlay,
          { backgroundColor: withOpacity(color, 0.05) },
        ]}
      />
      <View style={[styles.iconContainer, { backgroundColor: withOpacity(color, 0.12) }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <ThemedText type="stat" style={[styles.value, { color: theme.text }]}>
        {value}
      </ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {title}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    flexGrow: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  value: {
    marginBottom: Spacing.xs,
  },
});
