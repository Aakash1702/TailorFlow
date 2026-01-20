import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { AnimatedPressable } from "./AnimatedPressable";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, Colors } from "@/constants/theme";

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  accentColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({
  title,
  value,
  icon,
  accentColor,
  onPress,
  style,
}: StatCardProps) {
  const { theme } = useTheme();
  const accent = accentColor || Colors.light.accent;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.container,
        { 
          backgroundColor: theme.backgroundDefault,
        },
        Shadows.level1,
        style,
      ]}
      scaleValue={0.985}
      opacityValue={0.92}
    >
      <View style={styles.header}>
        <Feather name={icon} size={22} color={accent} />
      </View>
      <View style={styles.content}>
        <ThemedText style={[styles.value, { color: theme.text }]}>
          {value}
        </ThemedText>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
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
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  header: {
    marginBottom: Spacing.lg,
  },
  content: {
    gap: Spacing.xs,
  },
  value: {
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  label: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
    textTransform: "capitalize",
  },
});
