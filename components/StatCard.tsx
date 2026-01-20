import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { AnimatedPressable } from "./AnimatedPressable";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  gradientColors: [string, string];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({
  title,
  value,
  icon,
  gradientColors,
  onPress,
  style,
}: StatCardProps) {
  const { theme } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: "#FFFFFF" },
        Shadows.level1,
        style,
      ]}
      scaleValue={0.96}
      opacityValue={0.95}
    >
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Feather name={icon} size={20} color="#FFFFFF" />
        </LinearGradient>
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.value}>
          {value}
        </ThemedText>
        <ThemedText style={[styles.label, { color: "#8E8E93" }]}>
          {title}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: "45%",
    padding: Spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 32,
    color: "#1C1C1E",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});
