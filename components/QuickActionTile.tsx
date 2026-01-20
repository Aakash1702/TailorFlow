import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { AnimatedPressable } from "./AnimatedPressable";
import { ThemedText } from "./ThemedText";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface QuickActionTileProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  gradientColors: [string, string];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function QuickActionTile({
  title,
  icon,
  gradientColors,
  onPress,
  style,
}: QuickActionTileProps) {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.container,
        Shadows.level1,
        style,
      ]}
      scaleValue={0.94}
      opacityValue={0.9}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconCircle}>
          <Feather name={icon} size={24} color="#FFFFFF" />
        </View>
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: "30%",
    borderRadius: 20,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
    color: "#FFFFFF",
  },
});
