import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, Order, Employee, Payment, ActivityItem, ExtrasPreset, OrderItem, OrderItemExtra } from '../types';

const SYNC_KEYS = {
  LAST_SYNC: 'tailorflow_last_sync',
  MIGRATION_COMPLETE: 'tailorflow_migration_complete',
};

type SupabaseCustomer = {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  measurements: object;
  notes: string | null;
  outstanding_balance: number;
  created_at: string;
  updated_at: string;
};

type SupabaseEmployee = {
  id: string;
  shop_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  role: 'tailor' | 'manager' | 'admin';
  is_active: boolean;
  joined_at: string;
  created_at: string;
  updated_at: string;
};

type SupabaseOrder = {
  id: string;
  shop_id: string;
  customer_id: string;
  customer_name: string;
  description: string;
  status: 'pending' | 'inProgress' | 'completed' | 'delivered';
  amount: number;
  paid_amount: number;
  due_date: string;
  assigned_employee_id: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  delivered_at: string | null;
  updated_at: string;
};

type SupabaseOrderItem = {
  id: string;
  order_id: string;
  name: string;
  quantity: number;
  base_price: number;
  notes: string | null;
  created_at: string;
};

type SupabaseOrderItemExtra = {
  id: string;
  order_item_id: string;
  label: string;
  amount: number;
  created_at: string;
};

type SupabasePayment = {
  id: string;
  shop_id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  payment_mode: 'cash' | 'card' | 'upi' | 'wallet' | 'bank';
  notes: string | null;
  created_at: string;
};

type SupabaseActivity = {
  id: string;
  shop_id: string;
  type: 'order_created' | 'order_updated' | 'payment_received' | 'order_completed' | 'order_delivered';
  order_id: string | null;
  customer_name: string;
  description: string;
  created_at: string;
};

type SupabaseExtrasPreset = {
  id: string;
  shop_id: string;
  label: string;
  amount: number;
  category: 'design' | 'material' | 'finishing' | 'other';
  created_at: string;
  updated_at: string;
};

export class SupabaseDataService {
  private shopId: string | null = null;

  setShopId(shopId: string) {
    this.shopId = shopId;
  }

  private ensureShopId(): string {
    if (!this.shopId) {
      throw new Error('Shop ID not set. Please login first.');
    }
    return this.shopId;
  }

  async getCustomers(): Promise<Customer[]> {
    const shopId = this.ensureShopId();
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.mapSupabaseCustomer);
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const shopId = this.ensureShopId();

    const { data, error } = await supabase
      .from('customers')
      .insert({
        shop_id: shopId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        address: customer.address || null,
        measurements: customer.measurements || {},
        notes: customer.notes || null,
        outstanding_balance: customer.outstandingBalance || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseCustomer(data);
  }

  async updateCustomer(customer: Customer): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        address: customer.address || null,
        measurements: customer.measurements || {},
        notes: customer.notes || null,
        outstanding_balance: customer.outstandingBalance || 0,
      })
      .eq('id', customer.id)
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseCustomer(data);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
  }

  async getEmployees(): Promise<Employee[]> {
    const shopId = this.ensureShopId();

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const employees = (data || []).map(this.mapSupabaseEmployee);
    
    const orders = await this.getOrders();
    return employees.map(emp => ({
      ...emp,
      assignedOrders: orders
        .filter(o => o.assignedEmployeeId === emp.id)
        .map(o => o.id),
    }));
  }

  async createEmployee(employee: Omit<Employee, 'id' | 'joinedAt' | 'assignedOrders'>): Promise<Employee> {
    const shopId = this.ensureShopId();

    const { data, error } = await supabase
      .from('employees')
      .insert({
        shop_id: shopId,
        name: employee.name,
        phone: employee.phone,
        email: employee.email || null,
        role: employee.role,
        is_active: employee.isActive,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseEmployee(data);
  }

  async updateEmployee(employee: Employee): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update({
        name: employee.name,
        phone: employee.phone,
        email: employee.email || null,
        role: employee.role,
        is_active: employee.isActive,
      })
      .eq('id', employee.id)
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseEmployee(data);
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (error) throw error;
  }

  async getOrders(): Promise<Order[]> {
    const shopId = this.ensureShopId();

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    const orders: Order[] = [];

    for (const order of ordersData || []) {
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      const items: OrderItem[] = [];

      for (const item of itemsData || []) {
        const { data: extrasData } = await supabase
          .from('order_item_extras')
          .select('*')
          .eq('order_item_id', item.id);

        items.push({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          basePrice: item.base_price,
          notes: item.notes || undefined,
          extras: (extrasData || []).map((e: SupabaseOrderItemExtra) => ({
            id: e.id,
            label: e.label,
            amount: e.amount,
          })),
        });
      }

      orders.push(this.mapSupabaseOrder(order, items));
    }

    return orders;
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const shopId = this.ensureShopId();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        shop_id: shopId,
        customer_id: order.customerId,
        customer_name: order.customerName,
        description: order.description,
        status: order.status,
        amount: order.amount,
        paid_amount: order.paidAmount,
        due_date: order.dueDate,
        assigned_employee_id: order.assignedEmployeeId || null,
        notes: order.notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const items: OrderItem[] = [];

    for (const item of order.items) {
      const { data: itemData, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderData.id,
          name: item.name,
          quantity: item.quantity,
          base_price: item.basePrice,
          notes: item.notes || null,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      const extras: OrderItemExtra[] = [];

      for (const extra of item.extras || []) {
        const { data: extraData, error: extraError } = await supabase
          .from('order_item_extras')
          .insert({
            order_item_id: itemData.id,
            label: extra.label,
            amount: extra.amount,
          })
          .select()
          .single();

        if (extraError) throw extraError;

        extras.push({
          id: extraData.id,
          label: extraData.label,
          amount: extraData.amount,
        });
      }

      items.push({
        id: itemData.id,
        name: itemData.name,
        quantity: itemData.quantity,
        basePrice: itemData.base_price,
        notes: itemData.notes || undefined,
        extras,
      });
    }

    await this.createActivity({
      type: 'order_created',
      orderId: orderData.id,
      customerName: order.customerName,
      description: `New order created for ${order.customerName}`,
    });

    return this.mapSupabaseOrder(orderData, items);
  }

  async updateOrder(order: Order): Promise<Order> {
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', order.id)
      .single();

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({
        customer_id: order.customerId,
        customer_name: order.customerName,
        description: order.description,
        status: order.status,
        amount: order.amount,
        paid_amount: Math.min(order.paidAmount, order.amount),
        due_date: order.dueDate,
        assigned_employee_id: order.assignedEmployeeId || null,
        notes: order.notes || null,
        completed_at: order.completedAt || null,
        delivered_at: order.deliveredAt || null,
      })
      .eq('id', order.id)
      .select()
      .single();

    if (orderError) throw orderError;

    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', order.id);

    const items: OrderItem[] = [];

    for (const item of order.items) {
      const { data: itemData, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          name: item.name,
          quantity: item.quantity,
          base_price: item.basePrice,
          notes: item.notes || null,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      const extras: OrderItemExtra[] = [];

      for (const extra of item.extras || []) {
        const { data: extraData, error: extraError } = await supabase
          .from('order_item_extras')
          .insert({
            order_item_id: itemData.id,
            label: extra.label,
            amount: extra.amount,
          })
          .select()
          .single();

        if (extraError) throw extraError;

        extras.push({
          id: extraData.id,
          label: extraData.label,
          amount: extraData.amount,
        });
      }

      items.push({
        id: itemData.id,
        name: itemData.name,
        quantity: itemData.quantity,
        basePrice: itemData.base_price,
        notes: itemData.notes || undefined,
        extras,
      });
    }

    if (existingOrder && existingOrder.status !== order.status) {
      let activityType: 'order_updated' | 'order_completed' | 'order_delivered' = 'order_updated';
      if (order.status === 'completed') activityType = 'order_completed';
      if (order.status === 'delivered') activityType = 'order_delivered';

      await this.createActivity({
        type: activityType,
        orderId: order.id,
        customerName: order.customerName,
        description: `Order ${order.status === 'completed' ? 'completed' : order.status === 'delivered' ? 'delivered' : 'updated'} for ${order.customerName}`,
      });
    }

    return this.mapSupabaseOrder(orderData, items);
  }

  async deleteOrder(orderId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
  }

  async getPayments(): Promise<Payment[]> {
    const shopId = this.ensureShopId();

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.mapSupabasePayment);
  }

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const shopId = this.ensureShopId();

    const { data, error } = await supabase
      .from('payments')
      .insert({
        shop_id: shopId,
        order_id: payment.orderId,
        customer_id: payment.customerId,
        customer_name: payment.customerName,
        amount: payment.amount,
        payment_mode: payment.paymentMode,
        notes: payment.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    await this.createActivity({
      type: 'payment_received',
      orderId: payment.orderId,
      customerName: payment.customerName,
      description: `Payment of ${payment.amount} received from ${payment.customerName}`,
    });

    const { data: orderData } = await supabase
      .from('orders')
      .select('paid_amount')
      .eq('id', payment.orderId)
      .single();

    if (orderData) {
      await supabase
        .from('orders')
        .update({ paid_amount: orderData.paid_amount + payment.amount })
        .eq('id', payment.orderId);
    }

    await this.updateCustomerBalance(payment.customerId);

    return this.mapSupabasePayment(data);
  }

  async updateCustomerBalance(customerId: string): Promise<void> {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('amount, paid_amount')
      .eq('customer_id', customerId);

    const outstandingBalance = (ordersData || []).reduce(
      (sum, o) => sum + (o.amount - o.paid_amount),
      0
    );

    await supabase
      .from('customers')
      .update({ outstanding_balance: outstandingBalance })
      .eq('id', customerId);
  }

  async getActivities(): Promise<ActivityItem[]> {
    const shopId = this.ensureShopId();

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data || []).map((a: SupabaseActivity) => ({
      id: a.id,
      type: a.type,
      orderId: a.order_id || undefined,
      customerName: a.customer_name,
      description: a.description,
      timestamp: a.created_at,
    }));
  }

  async createActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<void> {
    const shopId = this.ensureShopId();

    await supabase.from('activities').insert({
      shop_id: shopId,
      type: activity.type,
      order_id: activity.orderId || null,
      customer_name: activity.customerName,
      description: activity.description,
    });
  }

  async getExtrasPresets(): Promise<ExtrasPreset[]> {
    const shopId = this.ensureShopId();

    const { data, error } = await supabase
      .from('extras_presets')
      .select('*')
      .eq('shop_id', shopId)
      .order('category', { ascending: true });

    if (error) throw error;

    return (data || []).map((p: SupabaseExtrasPreset) => ({
      id: p.id,
      label: p.label,
      amount: p.amount,
      category: p.category,
    }));
  }

  async createExtrasPreset(preset: Omit<ExtrasPreset, 'id'>): Promise<ExtrasPreset> {
    const shopId = this.ensureShopId();

    const { data, error } = await supabase
      .from('extras_presets')
      .insert({
        shop_id: shopId,
        label: preset.label,
        amount: preset.amount,
        category: preset.category,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      label: data.label,
      amount: data.amount,
      category: data.category,
    };
  }

  async updateExtrasPreset(preset: ExtrasPreset): Promise<ExtrasPreset> {
    const { data, error } = await supabase
      .from('extras_presets')
      .update({
        label: preset.label,
        amount: preset.amount,
        category: preset.category,
      })
      .eq('id', preset.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      label: data.label,
      amount: data.amount,
      category: data.category,
    };
  }

  async deleteExtrasPreset(presetId: string): Promise<void> {
    const { error } = await supabase
      .from('extras_presets')
      .delete()
      .eq('id', presetId);

    if (error) throw error;
  }

  async assignEmployeeToOrder(orderId: string, employeeId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ assigned_employee_id: employeeId })
      .eq('id', orderId);

    if (error) throw error;
  }

  async unassignEmployeeFromOrder(orderId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ assigned_employee_id: null })
      .eq('id', orderId);

    if (error) throw error;
  }

  private mapSupabaseCustomer(c: SupabaseCustomer): Customer {
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || undefined,
      address: c.address || undefined,
      measurements: c.measurements as Customer['measurements'],
      notes: c.notes || undefined,
      outstandingBalance: c.outstanding_balance,
      createdAt: c.created_at,
    };
  }

  private mapSupabaseEmployee(e: SupabaseEmployee): Employee {
    return {
      id: e.id,
      name: e.name,
      phone: e.phone,
      email: e.email || undefined,
      role: e.role,
      isActive: e.is_active,
      joinedAt: e.joined_at,
      assignedOrders: [],
    };
  }

  private mapSupabaseOrder(o: SupabaseOrder, items: OrderItem[]): Order {
    return {
      id: o.id,
      customerId: o.customer_id,
      customerName: o.customer_name,
      description: o.description,
      status: o.status,
      amount: o.amount,
      paidAmount: o.paid_amount,
      dueDate: o.due_date,
      assignedEmployeeId: o.assigned_employee_id || undefined,
      notes: o.notes || undefined,
      createdAt: o.created_at,
      completedAt: o.completed_at || undefined,
      deliveredAt: o.delivered_at || undefined,
      items,
    };
  }

  private mapSupabasePayment(p: SupabasePayment): Payment {
    return {
      id: p.id,
      orderId: p.order_id,
      customerId: p.customer_id,
      customerName: p.customer_name,
      amount: p.amount,
      paymentMode: p.payment_mode,
      createdAt: p.created_at,
      notes: p.notes || undefined,
    };
  }
}

export const supabaseDataService = new SupabaseDataService();
