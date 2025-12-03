import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import DashboardStackNavigator from "@/navigation/DashboardStackNavigator";
import CustomersStackNavigator from "@/navigation/CustomersStackNavigator";
import OrdersStackNavigator from "@/navigation/OrdersStackNavigator";
import EmployeesStackNavigator from "@/navigation/EmployeesStackNavigator";
import MoreStackNavigator from "@/navigation/MoreStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export type MainTabParamList = {
  DashboardTab: undefined;
  CustomersTab: undefined;
  OrdersTab: undefined;
  EmployeesTab: undefined;
  MoreTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: -2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundDefault,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.select({ ios: 84, android: 64 }),
          paddingTop: Spacing.xs,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderTopWidth: 1,
                  borderTopColor: theme.borderLight,
                },
              ]}
            />
          ),
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CustomersTab"
        component={CustomersStackNavigator}
        options={{
          title: "Customers",
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EmployeesTab"
        component={EmployeesStackNavigator}
        options={{
          title: "Employees",
          tabBarIcon: ({ color, size }) => (
            <Feather name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <Feather name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
