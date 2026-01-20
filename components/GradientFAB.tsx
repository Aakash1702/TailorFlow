import React from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Shadows } from "@/constants/theme";

interface GradientFABProps {
  icon?: keyof typeof Feather.glyphMap;
  gradientColors?: [string, string];
  onPress: () => void;
  bottom: number;
  style?: StyleProp<ViewStyle>;
}

export function GradientFAB({
  icon = "plus",
  gradientColors = ["#FF6B6B", "#FF8E53"],
  onPress,
  bottom,
  style,
}: GradientFABProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { bottom },
        Shadows.level2,
        { transform: [{ scale: pressed ? 0.92 : 1 }] },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Feather name={icon} size={24} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    borderRadius: 28,
    overflow: "hidden",
  },
  gradient: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});
