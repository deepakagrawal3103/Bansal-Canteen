
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, MenuItem, DailyStock, Order, CartItem, OrderStatus, PaymentMode, PaymentConfig } from './types';
import * as db from './services/dataService';

interface AppContextType {
  state: AppState;
  refreshState: () => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  submitOrder: (mode: PaymentMode) => Promise<Order>;
  updateOrder: (orderId: string, status: OrderStatus) => void;
  updateStock: (itemId: string, updates: Partial<DailyStock>) => void;
  saveMenuItem: (item: MenuItem) => void;
  addNewMenuItem: (name: string, price: number, image: string, category: string) => void;
  updateStaffPin: (newPin: string) => void;
  updateAdminMobile: (newMobile: string) => void;
  updatePaymentConfig: (config: PaymentConfig) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(db.getAppState());

  const refreshState = useCallback(() => {
    setState(db.getAppState());
  }, []);

  // Hydrate on mount, sync periodically, and listen for cross-tab updates
  useEffect(() => {
    refreshState();
    
    // Polling backup
    const interval = setInterval(refreshState, 5000); 

    // Instant cross-tab update
    db.subscribeToUpdates(() => {
      refreshState();
    });

    return () => clearInterval(interval);
  }, [refreshState]);

  const addToCart = (item: MenuItem) => {
    const existing = state.cart.find(c => c.id === item.id);
    let newCart;
    if (existing) {
      newCart = state.cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
    } else {
      newCart = [...state.cart, { ...item, qty: 1 }];
    }
    // Update DB immediately to prevent sync overwriting local state
    db.updateCart(newCart);
    setState(prev => ({ ...prev, cart: newCart }));
  };

  const removeFromCart = (itemId: string) => {
    const existing = state.cart.find(c => c.id === itemId);
    if (!existing) return;
    
    let newCart;
    if (existing.qty > 1) {
       newCart = state.cart.map(c => c.id === itemId ? { ...c, qty: c.qty - 1 } : c);
    } else {
       newCart = state.cart.filter(c => c.id !== itemId);
    }
    // Update DB immediately
    db.updateCart(newCart);
    setState(prev => ({ ...prev, cart: newCart }));
  };

  const clearCart = () => {
    db.updateCart([]);
    setState(prev => ({ ...prev, cart: [] }));
  }

  const submitOrder = async (mode: PaymentMode): Promise<Order> => {
    const total = state.cart.reduce((sum, i) => sum + (i.basePrice * i.qty), 0);
    const order = db.placeOrder(state.cart, total, mode);
    refreshState();
    return order;
  };

  const updateOrder = (orderId: string, status: OrderStatus) => {
    db.updateOrderStatus(orderId, status);
    refreshState();
  };

  const updateStock = (itemId: string, updates: Partial<DailyStock>) => {
    db.updateDailyStock(itemId, updates);
    refreshState();
  };

  const saveMenuItem = (item: MenuItem) => {
      db.updateMenuItem(item);
      refreshState();
  }

  const addNewMenuItem = (name: string, price: number, image: string, category: string) => {
      db.addNewMenuItem(name, price, image, category);
      refreshState();
  }

  const updateStaffPin = (newPin: string) => {
    db.updateStaffPin(newPin);
    refreshState();
  };

  const updateAdminMobile = (newMobile: string) => {
      db.updateAdminMobile(newMobile);
      refreshState();
  }

  const updatePaymentConfig = (config: PaymentConfig) => {
      db.updatePaymentConfig(config);
      refreshState();
  }

  return (
    <AppContext.Provider value={{ 
      state, 
      refreshState, 
      addToCart, 
      removeFromCart, 
      clearCart,
      submitOrder, 
      updateOrder,
      updateStock,
      saveMenuItem,
      addNewMenuItem,
      updateStaffPin,
      updateAdminMobile,
      updatePaymentConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
