import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AnimatedPressable } from "./AnimatedPressable";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, Colors } from "@/constants/theme";

interface QuickActionTileProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function QuickActionTile({
  title,
  icon,
  onPress,
  style,
}: QuickActionTileProps) {
  const { theme } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
        Shadows.level1,
        style,
      ]}
      scaleValue={0.97}
      opacityValue={0.92}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name={icon} size={22} color={theme.text} />
      </View>
      <ThemedText style={[styles.title, { color: theme.text }]}>
        {title}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
});
