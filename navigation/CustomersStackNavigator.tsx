import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CustomersScreen from "@/screens/CustomersScreen";
import CustomerDetailScreen from "@/screens/CustomerDetailScreen";
import AddCustomerScreen from "@/screens/AddCustomerScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type CustomersStackParamList = {
  Customers: undefined;
  CustomerDetail: { customerId: string };
  AddCustomer: { customerId?: string } | undefined;
};

const Stack = createNativeStackNavigator<CustomersStackParamList>();

export default function CustomersStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          title: "Customers",
        }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{
          title: "Customer Details",
        }}
      />
      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
        options={{
          title: "Add Customer",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
