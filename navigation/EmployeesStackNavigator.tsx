import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EmployeesScreen from "@/screens/EmployeesScreen";
import EmployeeDetailScreen from "@/screens/EmployeeDetailScreen";
import AddEmployeeScreen from "@/screens/AddEmployeeScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type EmployeesStackParamList = {
  Employees: undefined;
  EmployeeDetail: { employeeId: string };
  AddEmployee: { employeeId?: string } | undefined;
};

const Stack = createNativeStackNavigator<EmployeesStackParamList>();

export default function EmployeesStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Employees"
        component={EmployeesScreen}
        options={{
          title: "Employees",
        }}
      />
      <Stack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={{
          title: "Employee Details",
        }}
      />
      <Stack.Screen
        name="AddEmployee"
        component={AddEmployeeScreen}
        options={{
          title: "Add Employee",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
