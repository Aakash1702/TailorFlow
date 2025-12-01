import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { SupabaseDataService } from '../services/SupabaseDataService';
import * as LocalStorage from '../utils/storage';
import { useAuth } from './AuthContext';
import { Customer, Order, Employee, Payment, ActivityItem, ExtrasPreset } from '../types';

type DataContextType = {
  isOnline: boolean;
  isSyncing: boolean;
  
  getCustomers: () => Promise<Customer[]>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  updateCustomerBalance: (customerId: string, amount: number) => Promise<void>;
  
  getOrders: () => Promise<Order[]>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  assignEmployeeToOrder: (orderId: string, employeeId: string) => Promise<void>;
  unassignEmployeeFromOrder: (orderId: string) => Promise<void>;
  
  getEmployees: () => Promise<Employee[]>;
  addEmployee: (employee: Omit<Employee, 'id' | 'joinedAt'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  
  getPayments: () => Promise<Payment[]>;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  
  getActivities: () => Promise<ActivityItem[]>;
  
  getExtrasPresets: () => Promise<ExtrasPreset[]>;
  saveExtrasPresets: (presets: ExtrasPreset[]) => Promise<void>;
  
  getUserName: () => Promise<string>;
  getShopName: () => Promise<string>;
  
  syncData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { profile, shop, session } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const supabaseService = useMemo(() => new SupabaseDataService(), []);
  
  const isLoggedIn = !!session && !!profile?.shop_id;
  
  useEffect(() => {
    if (profile?.shop_id) {
      supabaseService.setShopId(profile.shop_id);
    }
  }, [profile?.shop_id, supabaseService]);
  
  const getCustomers = useCallback(async (): Promise<Customer[]> => {
    if (isLoggedIn && isOnline) {
      try {
        return await supabaseService.getCustomers();
      } catch (error) {
        console.error('Supabase getCustomers failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getCustomers();
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<void> => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    await LocalStorage.addCustomer(newCustomer);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.createCustomer(customer);
      } catch (error) {
        console.error('Supabase addCustomer failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const updateCustomer = useCallback(async (customer: Customer): Promise<void> => {
    await LocalStorage.updateCustomer(customer);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.updateCustomer(customer);
      } catch (error) {
        console.error('Supabase updateCustomer failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const deleteCustomer = useCallback(async (customerId: string): Promise<void> => {
    await LocalStorage.deleteCustomer(customerId);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.deleteCustomer(customerId);
      } catch (error) {
        console.error('Supabase deleteCustomer failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const updateCustomerBalance = useCallback(async (customerId: string, amount: number): Promise<void> => {
    await LocalStorage.updateCustomerBalance(customerId, amount);
    
    if (isLoggedIn && isOnline) {
      try {
        const customers = await supabaseService.getCustomers();
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          await supabaseService.updateCustomer({
            ...customer,
            outstandingBalance: customer.outstandingBalance + amount,
          });
        }
      } catch (error) {
        console.error('Supabase updateCustomerBalance failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const getOrders = useCallback(async (): Promise<Order[]> => {
    if (isLoggedIn && isOnline) {
      try {
        return await supabaseService.getOrders();
      } catch (error) {
        console.error('Supabase getOrders failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getOrders();
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    await LocalStorage.addOrder(newOrder);
    
    if (isLoggedIn && isOnline) {
      try {
        const createdOrder = await supabaseService.createOrder(order);
        return createdOrder;
      } catch (error) {
        console.error('Supabase addOrder failed:', error);
      }
    }
    
    return newOrder;
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const updateOrder = useCallback(async (order: Order): Promise<void> => {
    await LocalStorage.updateOrder(order);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.updateOrder(order);
      } catch (error) {
        console.error('Supabase updateOrder failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const deleteOrder = useCallback(async (orderId: string): Promise<void> => {
    await LocalStorage.deleteOrder(orderId);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.deleteOrder(orderId);
      } catch (error) {
        console.error('Supabase deleteOrder failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const assignEmployeeToOrder = useCallback(async (orderId: string, employeeId: string): Promise<void> => {
    await LocalStorage.assignEmployeeToOrder(orderId, employeeId);
    
    if (isLoggedIn && isOnline) {
      try {
        const orders = await supabaseService.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await supabaseService.updateOrder({
            ...order,
            assignedEmployeeId: employeeId,
          });
        }
      } catch (error) {
        console.error('Supabase assignEmployeeToOrder failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const unassignEmployeeFromOrder = useCallback(async (orderId: string): Promise<void> => {
    await LocalStorage.unassignEmployeeFromOrder(orderId);
    
    if (isLoggedIn && isOnline) {
      try {
        const orders = await supabaseService.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
          await supabaseService.updateOrder({
            ...order,
            assignedEmployeeId: undefined,
          });
        }
      } catch (error) {
        console.error('Supabase unassignEmployeeFromOrder failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const getEmployees = useCallback(async (): Promise<Employee[]> => {
    if (isLoggedIn && isOnline) {
      try {
        return await supabaseService.getEmployees();
      } catch (error) {
        console.error('Supabase getEmployees failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getEmployees();
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const addEmployee = useCallback(async (employee: Omit<Employee, 'id' | 'joinedAt'>): Promise<void> => {
    const newEmployee: Employee = {
      ...employee,
      id: generateId(),
      joinedAt: new Date().toISOString(),
    };
    
    await LocalStorage.addEmployee(newEmployee);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.createEmployee(employee);
      } catch (error) {
        console.error('Supabase addEmployee failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const updateEmployee = useCallback(async (employee: Employee): Promise<void> => {
    await LocalStorage.updateEmployee(employee);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.updateEmployee(employee);
      } catch (error) {
        console.error('Supabase updateEmployee failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const deleteEmployee = useCallback(async (employeeId: string): Promise<void> => {
    await LocalStorage.deleteEmployee(employeeId);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.deleteEmployee(employeeId);
      } catch (error) {
        console.error('Supabase deleteEmployee failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const getPayments = useCallback(async (): Promise<Payment[]> => {
    if (isLoggedIn && isOnline) {
      try {
        return await supabaseService.getPayments();
      } catch (error) {
        console.error('Supabase getPayments failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getPayments();
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt'>): Promise<void> => {
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    await LocalStorage.addPayment(newPayment);
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.createPayment(payment);
      } catch (error) {
        console.error('Supabase addPayment failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const getActivities = useCallback(async (): Promise<ActivityItem[]> => {
    if (isLoggedIn && isOnline) {
      try {
        return await supabaseService.getActivities();
      } catch (error) {
        console.error('Supabase getActivities failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getActivities();
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const getExtrasPresets = useCallback(async (): Promise<ExtrasPreset[]> => {
    if (isLoggedIn && isOnline) {
      try {
        return await supabaseService.getExtrasPresets();
      } catch (error) {
        console.error('Supabase getExtrasPresets failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getExtrasPresets();
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const saveExtrasPresets = useCallback(async (presets: ExtrasPreset[]): Promise<void> => {
    await LocalStorage.saveExtrasPresets(presets);
    
    if (isLoggedIn && isOnline) {
      try {
        for (const preset of presets) {
          if (preset.id.startsWith('preset_')) {
            await supabaseService.createExtrasPreset(preset);
          } else {
            await supabaseService.updateExtrasPreset(preset);
          }
        }
      } catch (error) {
        console.error('Supabase saveExtrasPresets failed:', error);
      }
    }
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const getUserName = useCallback(async (): Promise<string> => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    return LocalStorage.getUserName();
  }, [profile?.full_name]);
  
  const getShopName = useCallback(async (): Promise<string> => {
    if (shop?.name) {
      return shop.name;
    }
    return LocalStorage.getShopName();
  }, [shop?.name]);
  
  const syncData = useCallback(async (): Promise<void> => {
    if (!isLoggedIn) return;
    
    setIsSyncing(true);
    try {
      const [localCustomers, localOrders, localEmployees, localPayments] = await Promise.all([
        LocalStorage.getCustomers(),
        LocalStorage.getOrders(),
        LocalStorage.getEmployees(),
        LocalStorage.getPayments(),
      ]);
      
      const [cloudCustomers, cloudOrders, cloudEmployees, cloudPayments] = await Promise.all([
        supabaseService.getCustomers(),
        supabaseService.getOrders(),
        supabaseService.getEmployees(),
        supabaseService.getPayments(),
      ]);
      
      for (const local of localCustomers) {
        if (!cloudCustomers.find(c => c.id === local.id)) {
          await supabaseService.createCustomer(local);
        }
      }
      
      for (const local of localOrders) {
        if (!cloudOrders.find(o => o.id === local.id)) {
          await supabaseService.createOrder(local);
        }
      }
      
      for (const local of localEmployees) {
        if (!cloudEmployees.find(e => e.id === local.id)) {
          await supabaseService.createEmployee(local);
        }
      }
      
      for (const local of localPayments) {
        if (!cloudPayments.find(p => p.id === local.id)) {
          await supabaseService.createPayment(local);
        }
      }
      
      setIsOnline(true);
    } catch (error) {
      console.error('Data sync failed:', error);
      setIsOnline(false);
    } finally {
      setIsSyncing(false);
    }
  }, [isLoggedIn, supabaseService]);
  
  const value = {
    isOnline,
    isSyncing,
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerBalance,
    getOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    assignEmployeeToOrder,
    unassignEmployeeFromOrder,
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getPayments,
    addPayment,
    getActivities,
    getExtrasPresets,
    saveExtrasPresets,
    getUserName,
    getShopName,
    syncData,
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
