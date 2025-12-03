import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Customer, Order, Employee, Payment, ExtrasPreset, OrderItem } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'tailorflow_customers',
  ORDERS: 'tailorflow_orders',
  EMPLOYEES: 'tailorflow_employees',
  PAYMENTS: 'tailorflow_payments',
  EXTRAS_PRESETS: 'tailorflow_extras_presets',
};

const MIGRATION_KEY = 'tailorflow_migration_complete';

export function useMigration(shopId: string | null) {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const checkMigrationNeeded = useCallback(async (): Promise<boolean> => {
    if (!shopId) return false;
    
    try {
      const migrationComplete = await AsyncStorage.getItem(`${MIGRATION_KEY}_${shopId}`);
      if (migrationComplete === 'true') {
        return false;
      }

      const customersJson = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const ordersJson = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      const employeesJson = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      const paymentsJson = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);

      const customers = customersJson ? JSON.parse(customersJson) : [];
      const orders = ordersJson ? JSON.parse(ordersJson) : [];
      const employees = employeesJson ? JSON.parse(employeesJson) : [];
      const payments = paymentsJson ? JSON.parse(paymentsJson) : [];

      const hasRealData = customers.length > 0 || orders.length > 0 || employees.length > 0 || payments.length > 0;
      
      if (!hasRealData) {
        await AsyncStorage.setItem(`${MIGRATION_KEY}_${shopId}`, 'true');
        return false;
      }

      return true;
    } catch {
      await AsyncStorage.setItem(`${MIGRATION_KEY}_${shopId}`, 'true');
      return false;
    }
  }, [shopId]);

  const migrateData = useCallback(async (): Promise<boolean> => {
    if (!shopId) {
      setMigrationError('No shop ID available');
      return false;
    }

    setIsMigrating(true);
    setMigrationError(null);
    setMigrationProgress(0);

    try {
      const customersJson = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const ordersJson = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
      const employeesJson = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      const paymentsJson = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
      const presetsJson = await AsyncStorage.getItem(STORAGE_KEYS.EXTRAS_PRESETS);

      const localCustomers: Customer[] = customersJson ? JSON.parse(customersJson) : [];
      const localOrders: Order[] = ordersJson ? JSON.parse(ordersJson) : [];
      const localEmployees: Employee[] = employeesJson ? JSON.parse(employeesJson) : [];
      const localPayments: Payment[] = paymentsJson ? JSON.parse(paymentsJson) : [];
      const localPresets: ExtrasPreset[] = presetsJson ? JSON.parse(presetsJson) : [];

      const totalItems = localCustomers.length + localOrders.length + localEmployees.length + localPayments.length;
      let migratedItems = 0;

      const updateProgress = () => {
        migratedItems++;
        setMigrationProgress(Math.round((migratedItems / totalItems) * 100));
      };

      const customerIdMap = new Map<string, string>();
      const employeeIdMap = new Map<string, string>();
      const orderIdMap = new Map<string, string>();

      for (const customer of localCustomers) {
        try {
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
            .select('id')
            .single();

          if (!error && data) {
            customerIdMap.set(customer.id, data.id);
          }
          updateProgress();
        } catch (err) {
          updateProgress();
        }
      }

      setMigrationProgress(25);

      for (const employee of localEmployees) {
        try {
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
            .select('id')
            .single();

          if (!error && data) {
            employeeIdMap.set(employee.id, data.id);
          }
          updateProgress();
        } catch (err) {
          updateProgress();
        }
      }

      setMigrationProgress(50);

      for (const order of localOrders) {
        try {
          const newCustomerId = customerIdMap.get(order.customerId);
          if (!newCustomerId) {
            updateProgress();
            continue;
          }

          const newEmployeeId = order.assignedEmployeeId
            ? employeeIdMap.get(order.assignedEmployeeId)
            : null;

          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              shop_id: shopId,
              customer_id: newCustomerId,
              customer_name: order.customerName,
              description: order.description,
              status: order.status,
              amount: order.amount,
              paid_amount: order.paidAmount,
              due_date: order.dueDate,
              assigned_employee_id: newEmployeeId,
              notes: order.notes || null,
              completed_at: order.completedAt || null,
              delivered_at: order.deliveredAt || null,
            })
            .select('id')
            .single();

          if (!orderError && orderData) {
            orderIdMap.set(order.id, orderData.id);

            for (const item of order.items || []) {
              const { data: itemData, error: itemError } = await supabase
                .from('order_items')
                .insert({
                  order_id: orderData.id,
                  name: item.name,
                  quantity: item.quantity,
                  base_price: item.basePrice,
                  notes: item.notes || null,
                })
                .select('id')
                .single();

              if (!itemError && itemData) {
                for (const extra of item.extras || []) {
                  await supabase.from('order_item_extras').insert({
                    order_item_id: itemData.id,
                    label: extra.label,
                    amount: extra.amount,
                  });
                }
              }
            }
          }
          updateProgress();
        } catch (err) {
          updateProgress();
        }
      }

      setMigrationProgress(75);

      for (const payment of localPayments) {
        try {
          const newOrderId = orderIdMap.get(payment.orderId);
          const newCustomerId = customerIdMap.get(payment.customerId);
          
          if (!newOrderId || !newCustomerId) {
            updateProgress();
            continue;
          }

          await supabase.from('payments').insert({
            shop_id: shopId,
            order_id: newOrderId,
            customer_id: newCustomerId,
            customer_name: payment.customerName,
            amount: payment.amount,
            payment_mode: payment.paymentMode,
            notes: payment.notes || null,
          });
          updateProgress();
        } catch (err) {
          updateProgress();
        }
      }

      await AsyncStorage.setItem(`${MIGRATION_KEY}_${shopId}`, 'true');
      
      setMigrationProgress(100);
      setIsMigrating(false);
      return true;
    } catch (error) {
      setMigrationError(error instanceof Error ? error.message : 'Migration failed');
      setIsMigrating(false);
      return false;
    }
  }, [shopId]);

  const skipMigration = useCallback(async () => {
    if (shopId) {
      await AsyncStorage.setItem(`${MIGRATION_KEY}_${shopId}`, 'true');
    }
  }, [shopId]);

  return {
    isMigrating,
    migrationError,
    migrationProgress,
    checkMigrationNeeded,
    migrateData,
    skipMigration,
  };
}
