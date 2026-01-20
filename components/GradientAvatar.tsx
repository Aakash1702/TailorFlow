import React from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "./ThemedText";

interface GradientAvatarProps {
  name: string;
  size?: number;
  gradientColors?: [string, string];
  style?: StyleProp<ViewStyle>;
}

const AVATAR_GRADIENTS: [string, string][] = [
  ["#FF6B6B", "#FF8E53"],
  ["#11998E", "#38EF7D"],
  ["#667EEA", "#764BA2"],
  ["#F2994A", "#F2C94C"],
  ["#4FACFE", "#00F2FE"],
  ["#FF758C", "#FF7EB3"],
  ["#A18CD1", "#FBC2EB"],
  ["#2193B0", "#6DD5ED"],
];

function getGradientForName(name: string): [string, string] {
  const charCode = name.charCodeAt(0) || 0;
  return AVATAR_GRADIENTS[charCode % AVATAR_GRADIENTS.length];
}

export function GradientAvatar({
  name,
  size = 48,
  gradientColors,
  style,
}: GradientAvatarProps) {
  const colors = gradientColors || getGradientForName(name);
  const fontSize = size * 0.4;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <ThemedText style={[styles.initial, { fontSize }]}>
        {name.charAt(0).toUpperCase()}
      </ThemedText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
