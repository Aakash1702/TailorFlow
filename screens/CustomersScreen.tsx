import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenFlatList } from "@/components/ScreenFlatList";
import { ThemedText } from "@/components/ThemedText";
import { GradientAvatar } from "@/components/GradientAvatar";
import { GradientFAB } from "@/components/GradientFAB";
import { useData } from "@/contexts/DataContext";
import { Spacing, Shadows } from "@/constants/theme";
import { CustomersStackParamList } from "@/navigation/CustomersStackNavigator";
import { formatCurrency } from "@/utils/storage";
import { Customer } from "@/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function CustomersScreen() {
  const { getCustomers } = useData();
  const navigation = useNavigation<NativeStackNavigationProp<CustomersStackParamList>>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const loadCustomers = useCallback(async () => {
    const data = await getCustomers();
    setCustomers(data);
  }, [getCustomers]);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <Pressable
      style={({ pressed }) => [
        styles.customerCard,
        Shadows.level1,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
      onPress={() => navigation.navigate("CustomerDetail", { customerId: item.id })}
    >
      <GradientAvatar name={item.name} size={50} />
      <View style={styles.customerInfo}>
        <ThemedText style={styles.customerName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.customerPhone}>
          {item.phone}
        </ThemedText>
      </View>
      {item.outstandingBalance > 0 ? (
        <View style={styles.balanceBadge}>
          <ThemedText style={styles.balanceText}>
            {formatCurrency(item.outstandingBalance)}
          </ThemedText>
        </View>
      ) : null}
      <Feather name="chevron-right" size={20} color="#C7C7CC" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScreenFlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={[styles.searchContainer, Shadows.level1]}>
            <Feather name="search" size={18} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search customers..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")}>
                <Feather name="x-circle" size={18} color="#8E8E93" />
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Feather name="users" size={32} color="#C7C7CC" />
            </View>
            <ThemedText style={styles.emptyTitle}>
              {searchQuery ? "No customers found" : "No customers yet"}
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {searchQuery ? "Try a different search" : "Add your first customer to get started"}
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
      <GradientFAB
        onPress={() => navigation.navigate("AddCustomer")}
        bottom={tabBarHeight + Spacing.xl}
        gradientColors={["#FF758C", "#FF7EB3"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    color: "#1C1C1E",
  },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: Spacing.lg,
    borderRadius: 16,
    gap: Spacing.md,
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  customerPhone: {
    fontSize: 14,
    color: "#8E8E93",
  },
  balanceBadge: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    padding: Spacing["2xl"],
    borderRadius: 20,
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});
