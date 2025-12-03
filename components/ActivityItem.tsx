import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ActivityItem as ActivityItemType } from "@/types";
import { getRelativeTime } from "@/utils/storage";
import { withOpacity } from "@/utils/colorUtils";

interface ActivityItemProps {
  activity: ActivityItemType;
  isLast?: boolean;
}

export function ActivityListItem({ activity, isLast = false }: ActivityItemProps) {
  const { theme } = useTheme();

  const getActivityIcon = (type: ActivityItemType["type"]) => {
    switch (type) {
      case "order_created":
        return "plus-circle";
      case "order_updated":
        return "edit";
      case "order_completed":
        return "check-circle";
      case "order_delivered":
        return "truck";
      case "payment_received":
        return "dollar-sign";
      default:
        return "activity";
    }
  };

  const getActivityColor = (type: ActivityItemType["type"]) => {
    switch (type) {
      case "order_created":
        return theme.info;
      case "order_updated":
        return theme.pending;
      case "order_completed":
        return theme.completed;
      case "order_delivered":
        return theme.delivered;
      case "payment_received":
        return theme.accent;
      default:
        return theme.textSecondary;
    }
  };

  const color = getActivityColor(activity.type);
  const icon = getActivityIcon(activity.type);

  return (
    <View
      style={[
        styles.container,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: theme.borderLight,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: withOpacity(color, 0.12) }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <View style={styles.content}>
        <ThemedText type="body" numberOfLines={1}>
          {activity.description}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {getRelativeTime(activity.timestamp)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
});
