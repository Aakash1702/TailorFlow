import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersScreen from "@/screens/OrdersScreen";
import OrderDetailScreen from "@/screens/OrderDetailScreen";
import AddOrderScreen from "@/screens/AddOrderScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type OrdersStackParamList = {
  Orders: undefined;
  OrderDetail: { orderId: string };
  AddOrder: { orderId?: string } | undefined;
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export default function OrdersStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: "Orders",
        }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          title: "Order Details",
        }}
      />
      <Stack.Screen
        name="AddOrder"
        component={AddOrderScreen}
        options={{
          title: "New Order",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
