import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ActivityItem as ActivityItemType } from "@/types";
import { getRelativeTime } from "@/utils/storage";

interface ActivityItemProps {
  activity: ActivityItemType;
  isLast?: boolean;
}

export function ActivityListItem({ activity, isLast = false }: ActivityItemProps) {
  const { theme } = useTheme();

  const getActivityIcon = (type: ActivityItemType["type"]): keyof typeof Feather.glyphMap => {
    switch (type) {
      case "order_created":
        return "plus";
      case "order_updated":
        return "edit-3";
      case "order_completed":
        return "check";
      case "order_delivered":
        return "package";
      case "payment_received":
        return "credit-card";
      default:
        return "activity";
    }
  };

  const getActivityColor = (type: ActivityItemType["type"]) => {
    switch (type) {
      case "order_created":
        return Colors.light.info;
      case "order_updated":
        return Colors.light.warning;
      case "order_completed":
        return Colors.light.success;
      case "order_delivered":
        return Colors.light.delivered;
      case "payment_received":
        return Colors.light.accent;
      default:
        return theme.textSecondary;
    }
  };

  const color = getActivityColor(activity.type);
  const icon = getActivityIcon(activity.type);

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Feather name={icon} size={12} color="#FFFFFF" />
        </View>
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
      </View>
      <View style={styles.content}>
        <ThemedText style={[styles.description, { color: theme.text }]} numberOfLines={2}>
          {activity.description}
        </ThemedText>
        <ThemedText style={[styles.timestamp, { color: theme.textSecondary }]}>
          {getRelativeTime(activity.timestamp)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  timelineContainer: {
    alignItems: "center",
    marginRight: Spacing.md,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
    borderRadius: 1,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
});
