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

export type GarmentType = 'blouse' | 'kurti' | 'salwar' | 'frock' | 'shirt' | 'pants' | 'lehenga' | 'other';
export type PatternStatus = 'draft' | 'generated' | 'printed' | 'archived';

export interface MeasurementField {
  key: string;
  label: string;
  required: boolean;
}

export interface PatternOptionSchema {
  label: string;
  options?: string[];
  type?: string;
  default: string | number;
}

export interface PatternTemplate {
  id: string;
  name: string;
  garmentType: GarmentType;
  description?: string;
  measurementFields: MeasurementField[];
  optionsSchema: Record<string, PatternOptionSchema>;
  formulaVersion: string;
  previewImageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PatternInstance {
  id: string;
  shopId: string;
  orderId?: string;
  customerId: string;
  templateId: string;
  measurements: Record<string, number>;
  options: Record<string, string | number>;
  status: PatternStatus;
  generatedSvg?: string;
  generatedFileUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatternPiece {
  name: string;
  path: string;
  width: number;
  height: number;
  labels: PatternLabel[];
}

export interface PatternLabel {
  text: string;
  x: number;
  y: number;
  rotation?: number;
}

export interface GeneratedPattern {
  pieces: PatternPiece[];
  totalWidth: number;
  totalHeight: number;
  svg: string;
}
