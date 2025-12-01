export type OrderStatus = 'pending' | 'inProgress' | 'completed' | 'delivered';

export interface Shop {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export interface Profile {
  id: string;
  user_id: string;
  shop_id: string;
  full_name: string;
  role: 'owner' | 'manager' | 'tailor';
  created_at: string;
}

export interface Customer {
  id: string;
  shop_id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  measurements: Measurements;
  notes?: string;
  createdAt: string;
  outstandingBalance: number;
}

export interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeveLength?: number;
  inseam?: number;
  outseam?: number;
  neck?: number;
  back?: number;
  custom?: { [key: string]: number };
}

export interface Order {
  id: string;
  shop_id?: string;
  customerId: string;
  customerName: string;
  description: string;
  status: OrderStatus;
  amount: number;
  paidAmount: number;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  deliveredAt?: string;
  notes?: string;
  assignedEmployeeId?: string;
  items: OrderItem[];
}

export interface OrderItemExtra {
  id: string;
  label: string;
  amount: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  basePrice: number;
  extras: OrderItemExtra[];
  notes?: string;
}

export interface ExtrasPreset {
  id: string;
  shop_id?: string;
  label: string;
  amount: number;
  category: 'design' | 'material' | 'finishing' | 'other';
}

export interface Employee {
  id: string;
  shop_id?: string;
  name: string;
  phone: string;
  email?: string;
  role: 'tailor' | 'manager' | 'admin';
  assignedOrders: string[];
  joinedAt: string;
  isActive: boolean;
}

export interface Payment {
  id: string;
  shop_id?: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'wallet' | 'bank';
  createdAt: string;
  notes?: string;
}

export interface DashboardStats {
  activeOrders: number;
  completedToday: number;
  todayRevenue: number;
  pendingPayments: number;
}

export interface ActivityItem {
  id: string;
  type: 'order_created' | 'order_updated' | 'payment_received' | 'order_completed' | 'order_delivered';
  orderId?: string;
  customerName: string;
  description: string;
  timestamp: string;
}
