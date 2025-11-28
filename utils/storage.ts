import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, Order, Employee, Payment, ActivityItem, ExtrasPreset, OrderItem } from '@/types';

const STORAGE_KEYS = {
  CUSTOMERS: 'tailorflow_customers',
  ORDERS: 'tailorflow_orders',
  EMPLOYEES: 'tailorflow_employees',
  PAYMENTS: 'tailorflow_payments',
  ACTIVITIES: 'tailorflow_activities',
  EXTRAS_PRESETS: 'tailorflow_extras_presets',
  USER_LOGGED_IN: 'tailorflow_user_logged_in',
  USER_NAME: 'tailorflow_user_name',
  SHOP_NAME: 'tailorflow_shop_name',
};

const DEFAULT_EXTRAS_PRESETS: ExtrasPreset[] = [
  { id: 'preset_1', label: 'Designer Work', amount: 200, category: 'design' },
  { id: 'preset_2', label: 'Embroidery', amount: 300, category: 'design' },
  { id: 'preset_3', label: 'Neck Zip', amount: 50, category: 'finishing' },
  { id: 'preset_4', label: 'Side Zip', amount: 50, category: 'finishing' },
  { id: 'preset_5', label: 'Lining', amount: 100, category: 'material' },
  { id: 'preset_6', label: 'Pico/Fall', amount: 80, category: 'finishing' },
  { id: 'preset_7', label: 'Padding', amount: 60, category: 'material' },
  { id: 'preset_8', label: 'Piping', amount: 40, category: 'finishing' },
  { id: 'preset_9', label: 'Hooks', amount: 30, category: 'finishing' },
  { id: 'preset_10', label: 'Steam Press', amount: 50, category: 'finishing' },
];

export async function getExtrasPresets(): Promise<ExtrasPreset[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EXTRAS_PRESETS);
    if (data) {
      return JSON.parse(data);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.EXTRAS_PRESETS, JSON.stringify(DEFAULT_EXTRAS_PRESETS));
    return DEFAULT_EXTRAS_PRESETS;
  } catch (error) {
    console.error('Error getting extras presets:', error);
    return DEFAULT_EXTRAS_PRESETS;
  }
}

export async function saveExtrasPresets(presets: ExtrasPreset[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXTRAS_PRESETS, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving extras presets:', error);
  }
}

export function calculateItemTotal(item: OrderItem): number {
  const extrasTotal = item.extras?.reduce((sum, extra) => sum + extra.amount, 0) || 0;
  return (item.basePrice + extrasTotal) * item.quantity;
}

export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
}

export async function saveCustomers(customers: Customer[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (error) {
    console.error('Error saving customers:', error);
  }
}

export async function addCustomer(customer: Customer): Promise<void> {
  const customers = await getCustomers();
  customers.unshift(customer);
  await saveCustomers(customers);
}

export async function updateCustomer(customer: Customer): Promise<void> {
  const customers = await getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index !== -1) {
    customers[index] = customer;
    await saveCustomers(customers);
  }
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const customers = await getCustomers();
  const filtered = customers.filter(c => c.id !== customerId);
  await saveCustomers(filtered);
}

export async function getOrders(): Promise<Order[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

export async function saveOrders(orders: Order[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving orders:', error);
  }
}

export async function addOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  orders.unshift(order);
  await saveOrders(orders);
  await addActivity({
    id: generateId(),
    type: 'order_created',
    orderId: order.id,
    customerName: order.customerName,
    description: `New order created for ${order.customerName}`,
    timestamp: new Date().toISOString(),
  });
}

export async function updateOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  if (index !== -1) {
    const oldOrder = orders[index];
    
    if (order.paidAmount > order.amount) {
      order.paidAmount = order.amount;
    }
    
    orders[index] = order;
    await saveOrders(orders);
    
    if (oldOrder.status !== order.status) {
      let activityType: ActivityItem['type'] = 'order_updated';
      if (order.status === 'completed') activityType = 'order_completed';
      if (order.status === 'delivered') activityType = 'order_delivered';
      
      await addActivity({
        id: generateId(),
        type: activityType,
        orderId: order.id,
        customerName: order.customerName,
        description: `Order ${order.status === 'completed' ? 'completed' : order.status === 'delivered' ? 'delivered' : 'updated'} for ${order.customerName}`,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  const orders = await getOrders();
  const orderToDelete = orders.find(o => o.id === orderId);
  const filtered = orders.filter(o => o.id !== orderId);
  await saveOrders(filtered);
  
  if (orderToDelete) {
    await updateCustomerBalance(orderToDelete.customerId);
    
    const employees = await getEmployees();
    const updatedEmployees = employees.map(e => ({
      ...e,
      assignedOrders: e.assignedOrders.filter(id => id !== orderId)
    }));
    await saveEmployees(updatedEmployees);
  }
}

export async function getEmployees(): Promise<Employee[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting employees:', error);
    return [];
  }
}

export async function saveEmployees(employees: Employee[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees:', error);
  }
}

export async function addEmployee(employee: Employee): Promise<void> {
  const employees = await getEmployees();
  employees.unshift(employee);
  await saveEmployees(employees);
}

export async function updateEmployee(employee: Employee): Promise<void> {
  const employees = await getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index !== -1) {
    employees[index] = employee;
    await saveEmployees(employees);
  }
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  const employees = await getEmployees();
  const filtered = employees.filter(e => e.id !== employeeId);
  await saveEmployees(filtered);
}

export async function getPayments(): Promise<Payment[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting payments:', error);
    return [];
  }
}

export async function savePayments(payments: Payment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (error) {
    console.error('Error saving payments:', error);
  }
}

export async function addPayment(payment: Payment): Promise<void> {
  const payments = await getPayments();
  payments.unshift(payment);
  await savePayments(payments);
  
  await addActivity({
    id: generateId(),
    type: 'payment_received',
    orderId: payment.orderId,
    customerName: payment.customerName,
    description: `Payment of ${formatCurrency(payment.amount)} received from ${payment.customerName}`,
    timestamp: new Date().toISOString(),
  });
  
  const orders = await getOrders();
  const orderIndex = orders.findIndex(o => o.id === payment.orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].paidAmount += payment.amount;
    await saveOrders(orders);
    
    await updateCustomerBalance(payment.customerId);
  }
}

export async function updateCustomerBalance(customerId: string): Promise<void> {
  const customers = await getCustomers();
  const orders = await getOrders();
  
  const customerIndex = customers.findIndex(c => c.id === customerId);
  if (customerIndex !== -1) {
    const customerOrders = orders.filter(o => o.customerId === customerId);
    const outstandingBalance = customerOrders.reduce((sum, o) => sum + (o.amount - o.paidAmount), 0);
    customers[customerIndex].outstandingBalance = outstandingBalance;
    await saveCustomers(customers);
  }
}

export async function assignEmployeeToOrder(orderId: string, employeeId: string): Promise<void> {
  const orders = await getOrders();
  const employees = await getEmployees();
  
  const orderIndex = orders.findIndex(o => o.id === orderId);
  const employeeIndex = employees.findIndex(e => e.id === employeeId);
  
  if (orderIndex !== -1 && employeeIndex !== -1) {
    const oldEmployeeId = orders[orderIndex].assignedEmployeeId;
    
    if (oldEmployeeId && oldEmployeeId !== employeeId) {
      const oldEmployeeIndex = employees.findIndex(e => e.id === oldEmployeeId);
      if (oldEmployeeIndex !== -1) {
        employees[oldEmployeeIndex].assignedOrders = employees[oldEmployeeIndex].assignedOrders.filter(id => id !== orderId);
      }
    }
    
    orders[orderIndex].assignedEmployeeId = employeeId;
    
    if (!employees[employeeIndex].assignedOrders.includes(orderId)) {
      employees[employeeIndex].assignedOrders.push(orderId);
    }
    
    await saveOrders(orders);
    await saveEmployees(employees);
  }
}

export async function unassignEmployeeFromOrder(orderId: string): Promise<void> {
  const orders = await getOrders();
  const employees = await getEmployees();
  
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex !== -1) {
    const employeeId = orders[orderIndex].assignedEmployeeId;
    
    if (employeeId) {
      const employeeIndex = employees.findIndex(e => e.id === employeeId);
      if (employeeIndex !== -1) {
        employees[employeeIndex].assignedOrders = employees[employeeIndex].assignedOrders.filter(id => id !== orderId);
        await saveEmployees(employees);
      }
    }
    
    orders[orderIndex].assignedEmployeeId = undefined;
    await saveOrders(orders);
  }
}

export async function getActivities(): Promise<ActivityItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting activities:', error);
    return [];
  }
}

export async function addActivity(activity: ActivityItem): Promise<void> {
  try {
    const activities = await getActivities();
    activities.unshift(activity);
    const recentActivities = activities.slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(recentActivities));
  } catch (error) {
    console.error('Error adding activity:', error);
  }
}

export async function isUserLoggedIn(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_LOGGED_IN);
    return data === 'true';
  } catch (error) {
    return false;
  }
}

export async function setUserLoggedIn(loggedIn: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_LOGGED_IN, loggedIn ? 'true' : 'false');
  } catch (error) {
    console.error('Error setting login state:', error);
  }
}

export async function getUserName(): Promise<string> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
    return data || '';
  } catch (error) {
    return '';
  }
}

export async function setUserName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  } catch (error) {
    console.error('Error setting user name:', error);
  }
}

export async function getShopName(): Promise<string> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SHOP_NAME);
    return data || 'TailorFlow';
  } catch (error) {
    return 'TailorFlow';
  }
}

export async function setShopName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SHOP_NAME, name);
  } catch (error) {
    console.error('Error setting shop name:', error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CUSTOMERS,
      STORAGE_KEYS.ORDERS,
      STORAGE_KEYS.EMPLOYEES,
      STORAGE_KEYS.PAYMENTS,
      STORAGE_KEYS.ACTIVITIES,
      STORAGE_KEYS.USER_LOGGED_IN,
      STORAGE_KEYS.USER_NAME,
      STORAGE_KEYS.SHOP_NAME,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}
