export type OrderStatus = 'pending' | 'inProgress' | 'completed' | 'delivered';

export interface Customer {
  id: string;
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

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Employee {
  id: string;
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
