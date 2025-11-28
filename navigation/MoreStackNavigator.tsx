import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MoreScreen from "@/screens/MoreScreen";
import PaymentsScreen from "@/screens/PaymentsScreen";
import AnalyticsScreen from "@/screens/AnalyticsScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import AddPaymentScreen from "@/screens/AddPaymentScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type MoreStackParamList = {
  More: undefined;
  Payments: undefined;
  Analytics: undefined;
  Settings: undefined;
  AddPayment: { orderId?: string; customerId?: string } | undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: "More",
        }}
      />
      <Stack.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: "Payments",
        }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: "Analytics",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="AddPayment"
        component={AddPaymentScreen}
        options={{
          title: "Record Payment",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
