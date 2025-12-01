import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { SupabaseDataService } from '../services/SupabaseDataService';
import * as LocalStorage from '../utils/storage';
import { useAuth } from './AuthContext';
import { Customer, Order, Employee, Payment, ActivityItem, ExtrasPreset } from '../types';

type DataContextType = {
  isOnline: boolean;
  isSyncing: boolean;
  
  getCustomers: () => Promise<Customer[]>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
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
  addEmployee: (employee: Omit<Employee, 'id' | 'joinedAt'>) => Promise<Employee>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  
  getPayments: () => Promise<Payment[]>;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<Payment>;
  
  getActivities: () => Promise<ActivityItem[]>;
  
  getExtrasPresets: () => Promise<ExtrasPreset[]>;
  saveExtrasPresets: (presets: ExtrasPreset[]) => Promise<void>;
  
  getUserName: () => Promise<string>;
  getShopName: () => Promise<string>;
  
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_ID_PREFIX = 'local_';

function isLocalId(id: string): boolean {
  return id.startsWith(LOCAL_ID_PREFIX);
}

function generateLocalId(): string {
  return LOCAL_ID_PREFIX + Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { profile, shop, session } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasInitialized = useRef(false);
  const idMapping = useRef<Map<string, string>>(new Map());
  
  const supabaseService = useMemo(() => new SupabaseDataService(), []);
  
  const isLoggedIn = !!session && !!profile?.shop_id;
  
  useEffect(() => {
    if (profile?.shop_id) {
      supabaseService.setShopId(profile.shop_id);
    }
  }, [profile?.shop_id, supabaseService]);
  
  useEffect(() => {
    if (isLoggedIn && !hasInitialized.current) {
      hasInitialized.current = true;
      syncPendingRecords();
    }
  }, [isLoggedIn]);
  
  const remapId = (id: string | undefined): string | undefined => {
    if (!id) return id;
    return idMapping.current.get(id) || id;
  };
  
  const syncPendingRecords = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setIsSyncing(true);
    idMapping.current.clear();
    
    try {
      const [localCustomers, localOrders, localEmployees, localPayments] = await Promise.all([
        LocalStorage.getCustomers(),
        LocalStorage.getOrders(),
        LocalStorage.getEmployees(),
        LocalStorage.getPayments(),
      ]);
      
      const pendingCustomers = localCustomers.filter(c => isLocalId(c.id));
      const pendingEmployees = localEmployees.filter(e => isLocalId(e.id));
      const pendingOrders = localOrders.filter(o => isLocalId(o.id));
      const pendingPayments = localPayments.filter(p => isLocalId(p.id));
      
      for (const customer of pendingCustomers) {
        try {
          const { id: localId, ...data } = customer;
          const created = await supabaseService.createCustomer(data);
          idMapping.current.set(localId, created.id);
          
          const current = await LocalStorage.getCustomers();
          const updated = current.filter(c => c.id !== localId);
          updated.push(created);
          await LocalStorage.setCustomers(updated);
        } catch (error) {
          console.error('Failed to sync customer:', error);
        }
      }
      
      for (const employee of pendingEmployees) {
        try {
          const { id: localId, ...data } = employee;
          const created = await supabaseService.createEmployee(data);
          idMapping.current.set(localId, created.id);
          
          const current = await LocalStorage.getEmployees();
          const updated = current.filter(e => e.id !== localId);
          updated.push(created);
          await LocalStorage.setEmployees(updated);
        } catch (error) {
          console.error('Failed to sync employee:', error);
        }
      }
      
      for (const order of pendingOrders) {
        try {
          const { id: localId, ...data } = order;
          const remappedOrder = {
            ...data,
            customerId: remapId(data.customerId) || data.customerId,
            assignedEmployeeId: remapId(data.assignedEmployeeId),
          };
          const created = await supabaseService.createOrder(remappedOrder);
          idMapping.current.set(localId, created.id);
          
          const current = await LocalStorage.getOrders();
          const updated = current.filter(o => o.id !== localId);
          updated.push(created);
          await LocalStorage.setOrders(updated);
        } catch (error) {
          console.error('Failed to sync order:', error);
        }
      }
      
      for (const payment of pendingPayments) {
        try {
          const { id: localId, ...data } = payment;
          const remappedPayment = {
            ...data,
            orderId: remapId(data.orderId) || data.orderId,
            customerId: remapId(data.customerId) || data.customerId,
          };
          const created = await supabaseService.createPayment(remappedPayment);
          idMapping.current.set(localId, created.id);
          
          const current = await LocalStorage.getPayments();
          const updated = current.filter(p => p.id !== localId);
          updated.push(created);
          await LocalStorage.setPayments(updated);
        } catch (error) {
          console.error('Failed to sync payment:', error);
        }
      }
      
      setIsOnline(true);
    } catch (error) {
      console.error('Sync failed:', error);
      setIsOnline(false);
    } finally {
      setIsSyncing(false);
    }
  }, [isLoggedIn, supabaseService]);
  
  const ensureSynced = useCallback(async () => {
    if (isOnline && !isSyncing) {
      const [localCustomers, localOrders, localEmployees, localPayments] = await Promise.all([
        LocalStorage.getCustomers(),
        LocalStorage.getOrders(),
        LocalStorage.getEmployees(),
        LocalStorage.getPayments(),
      ]);
      
      const hasPending = 
        localCustomers.some(c => isLocalId(c.id)) ||
        localOrders.some(o => isLocalId(o.id)) ||
        localEmployees.some(e => isLocalId(e.id)) ||
        localPayments.some(p => isLocalId(p.id));
      
      if (hasPending) {
        await syncPendingRecords();
      }
    }
  }, [isOnline, isSyncing, syncPendingRecords]);
  
  const getCustomers = useCallback(async (): Promise<Customer[]> => {
    if (isLoggedIn && isOnline) {
      try {
        await ensureSynced();
        const cloudData = await supabaseService.getCustomers();
        await LocalStorage.setCustomers(cloudData);
        return cloudData;
      } catch (error) {
        console.error('Supabase getCustomers failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getCustomers();
  }, [isLoggedIn, isOnline, supabaseService, ensureSynced]);
  
  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    if (isLoggedIn && isOnline) {
      try {
        await ensureSynced();
        const created = await supabaseService.createCustomer(customer);
        const current = await LocalStorage.getCustomers();
        await LocalStorage.setCustomers([...current, created]);
        return created;
      } catch (error) {
        console.error('Supabase addCustomer failed, storing locally:', error);
        setIsOnline(false);
      }
    }
    
    const newCustomer: Customer = {
      ...customer,
      id: generateLocalId(),
      createdAt: new Date().toISOString(),
    };
    await LocalStorage.addCustomer(newCustomer);
    return newCustomer;
  }, [isLoggedIn, isOnline, supabaseService, ensureSynced]);
  
  const updateCustomer = useCallback(async (customer: Customer): Promise<void> => {
    if (isLocalId(customer.id)) {
      await LocalStorage.updateCustomer(customer);
      return;
    }
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.updateCustomer(customer);
        await LocalStorage.updateCustomer(customer);
        return;
      } catch (error) {
        console.error('Supabase updateCustomer failed:', error);
        setIsOnline(false);
      }
    }
    await LocalStorage.updateCustomer(customer);
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const deleteCustomer = useCallback(async (customerId: string): Promise<void> => {
    if (isLocalId(customerId)) {
      await LocalStorage.deleteCustomer(customerId);
      return;
    }
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.deleteCustomer(customerId);
        await LocalStorage.deleteCustomer(customerId);
        return;
      } catch (error) {
        console.error('Supabase deleteCustomer failed:', error);
        setIsOnline(false);
      }
    }
    await LocalStorage.deleteCustomer(customerId);
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const updateCustomerBalance = useCallback(async (customerId: string, amount: number): Promise<void> => {
    const customers = await getCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      const updated = {
        ...customer,
        outstandingBalance: customer.outstandingBalance + amount,
      };
      await updateCustomer(updated);
    }
  }, [getCustomers, updateCustomer]);
  
  const getOrders = useCallback(async (): Promise<Order[]> => {
    if (isLoggedIn && isOnline) {
      try {
        await ensureSynced();
        const cloudData = await supabaseService.getOrders();
        await LocalStorage.setOrders(cloudData);
        return cloudData;
      } catch (error) {
        console.error('Supabase getOrders failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getOrders();
  }, [isLoggedIn, isOnline, supabaseService, ensureSynced]);
  
  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    if (isLoggedIn && isOnline) {
      try {
        await ensureSynced();
        const created = await supabaseService.createOrder(order);
        const current = await LocalStorage.getOrders();
        await LocalStorage.setOrders([...current, created]);
        return created;
      } catch (error) {
        console.error('Supabase addOrder failed, storing locally:', error);
        setIsOnline(false);
      }
    }
    
    const newOrder: Order = {
      ...order,
      id: generateLocalId(),
      createdAt: new Date().toISOString(),
    };
    await LocalStorage.addOrder(newOrder);
    return newOrder;
  }, [isLoggedIn, isOnline, supabaseService, ensureSynced]);
  
  const updateOrder = useCallback(async (order: Order): Promise<void> => {
    if (isLocalId(order.id)) {
      await LocalStorage.updateOrder(order);
      return;
    }
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.updateOrder(order);
        await LocalStorage.updateOrder(order);
        return;
      } catch (error) {
        console.error('Supabase updateOrder failed:', error);
        setIsOnline(false);
      }
    }
    await LocalStorage.updateOrder(order);
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const deleteOrder = useCallback(async (orderId: string): Promise<void> => {
    if (isLocalId(orderId)) {
      await LocalStorage.deleteOrder(orderId);
      return;
    }
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.deleteOrder(orderId);
        await LocalStorage.deleteOrder(orderId);
        return;
      } catch (error) {
        console.error('Supabase deleteOrder failed:', error);
        setIsOnline(false);
      }
    }
    await LocalStorage.deleteOrder(orderId);
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const assignEmployeeToOrder = useCallback(async (orderId: string, employeeId: string): Promise<void> => {
    const orders = await getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updated = { ...order, assignedEmployeeId: employeeId };
      await updateOrder(updated);
    }
  }, [getOrders, updateOrder]);
  
  const unassignEmployeeFromOrder = useCallback(async (orderId: string): Promise<void> => {
    const orders = await getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updated = { ...order, assignedEmployeeId: undefined };
      await updateOrder(updated);
    }
  }, [getOrders, updateOrder]);
  
  const getEmployees = useCallback(async (): Promise<Employee[]> => {
    if (isLoggedIn && isOnline) {
      try {
        await ensureSynced();
        const cloudData = await supabaseService.getEmployees();
        await LocalStorage.setEmployees(cloudData);
        return cloudData;
      } catch (error) {
        console.error('Supabase getEmployees failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getEmployees();
  }, [isLoggedIn, isOnline, supabaseService, ensureSynced]);
  
  const addEmployee = useCallback(async (employee: Omit<Employee, 'id' | 'joinedAt'>): Promise<Employee> => {
    if (isLoggedIn && isOnline) {
      try {
        await ensureSynced();
        const created = await supabaseService.createEmployee(employee);
        const current = await LocalStorage.getEmployees();
        await LocalStorage.setEmployees([...current, created]);
        return created;
      } catch (error) {
        console.error('Supabase addEmployee failed, storing locally:', error);
        setIsOnline(false);
      }
    }
    
    const newEmployee: Employee = {
      ...employee,
      id: generateLocalId(),
      joinedAt: new Date().toISOString(),
    };
    await LocalStorage.addEmployee(newEmployee);
    return newEmployee;
  }, [isLoggedIn, isOnline, supabaseService, ensureSynced]);
  
  const updateEmployee = useCallback(async (employee: Employee): Promise<void> => {
    if (isLocalId(employee.id)) {
      await LocalStorage.updateEmployee(employee);
      return;
    }
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.updateEmployee(employee);
        await LocalStorage.updateEmployee(employee);
        return;
      } catch (error) {
        console.error('Supabase updateEmployee failed:', error);
        setIsOnline(false);
      }
    }
    await LocalStorage.updateEmployee(employee);
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const deleteEmployee = useCallback(async (employeeId: string): Promise<void> => {
    if (isLocalId(employeeId)) {
      await LocalStorage.deleteEmployee(employeeId);
      return;
    }
    
    if (isLoggedIn && isOnline) {
      try {
        await supabaseService.deleteEmployee(employeeId);
        await LocalStorage.deleteEmployee(employeeId);
        return;
      } catch (error) {
        console.error('Supabase deleteEmployee failed:', error);
        setIsOnline(false);
      }
    }
    await LocalStorage.deleteEmployee(employeeId);
  }, [isLoggedIn, isOnline, supabaseService]);
  
  const getPayments = useCallback(async (): Promise<Payment[]> => {
    if (isLoggedIn && isOnline) {
      try {
        await ensureSynced();
        const cloudData = await supabaseService.getPayments();
        await LocalStorage.setPayments(cloudData);
        return cloudData;
      } catch (error) {
        console.error('Supabase getPayments failed, using local:', error);
        setIsOnline(false);
      }
    }
    return LocalStorage.getPayments();
  }, [isLoggedIn, isOnline, supabaseService, ensureSynced]);
  
  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
    if (isLoggedIn && isOnline) {
      try {
        await ensureSynced();
        const created = await supabaseService.createPayment(payment);
        const current = await LocalStorage.getPayments();
        await LocalStorage.setPayments([...current, created]);
        return created;
      } catch (error) {
        console.error('Supabase addPayment failed, storing locally:', error);
        setIsOnline(false);
      }
    }
    
    const newPayment: Payment = {
      ...payment,
      id: generateLocalId(),
      createdAt: new Date().toISOString(),
    };
    await LocalStorage.addPayment(newPayment);
    return newPayment;
  }, [isLoggedIn, isOnline, supabaseService, ensureSynced]);
  
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
        const cloudData = await supabaseService.getExtrasPresets();
        await LocalStorage.saveExtrasPresets(cloudData);
        return cloudData;
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
        const existing = await supabaseService.getExtrasPresets();
        const existingIds = new Set(existing.map(e => e.id));
        
        for (const preset of presets) {
          if (existingIds.has(preset.id)) {
            await supabaseService.updateExtrasPreset(preset);
          } else {
            await supabaseService.createExtrasPreset(preset);
          }
        }
      } catch (error) {
        console.error('Supabase saveExtrasPresets failed:', error);
        setIsOnline(false);
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
  
  const refreshData = useCallback(async (): Promise<void> => {
    if (!isLoggedIn) return;
    
    setIsSyncing(true);
    try {
      await syncPendingRecords();
      
      const [customers, orders, employees, payments, presets] = await Promise.all([
        supabaseService.getCustomers(),
        supabaseService.getOrders(),
        supabaseService.getEmployees(),
        supabaseService.getPayments(),
        supabaseService.getExtrasPresets(),
      ]);
      
      await Promise.all([
        LocalStorage.setCustomers(customers),
        LocalStorage.setOrders(orders),
        LocalStorage.setEmployees(employees),
        LocalStorage.setPayments(payments),
        LocalStorage.saveExtrasPresets(presets),
      ]);
      
      setIsOnline(true);
    } catch (error) {
      console.error('Refresh failed:', error);
      setIsOnline(false);
    } finally {
      setIsSyncing(false);
    }
  }, [isLoggedIn, supabaseService, syncPendingRecords]);
  
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
    refreshData,
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
