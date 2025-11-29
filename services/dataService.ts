
import { AppState, Order, MenuItem, DailyStock, OrderStatus, PaymentMode, CartItem, PaymentConfig } from '../types';
import { INITIAL_MENU, INITIAL_INVENTORY, INITIAL_ORDERS } from '../constants';

// Changed key to force fresh state and fix corruption/stale data issues
const DB_KEY = 'bansal_canteen_db_v3'; // Bumped to v3 for new schema

// Channel for cross-tab synchronization
const broadcastChannel = new BroadcastChannel('bansal_sync_channel');

const loadDB = (): AppState => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      const initialState: AppState = {
        menuMaster: INITIAL_MENU,
        dailyInventory: INITIAL_INVENTORY,
        orders: INITIAL_ORDERS,
        cart: [],
        staffPin: '1234',
        adminMobile: '9876543210',
        paymentConfig: { upiId: 'bansalcanteen@upi', merchantName: 'Bansal Canteen' }
      };
      saveDB(initialState, false); // Don't broadcast initial load
      return initialState;
    }
    const parsed = JSON.parse(stored);
    
    // Defensive coding: Ensure all required fields exist
    if (!parsed.cart) parsed.cart = [];
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.menuMaster) parsed.menuMaster = INITIAL_MENU;
    if (!parsed.dailyInventory) parsed.dailyInventory = INITIAL_INVENTORY;
    if (!parsed.staffPin) parsed.staffPin = '1234';
    if (!parsed.adminMobile) parsed.adminMobile = '9876543210';
    if (!parsed.paymentConfig) parsed.paymentConfig = { upiId: 'bansalcanteen@upi', merchantName: 'Bansal Canteen' };
    
    return parsed;
  } catch (error) {
    console.error("Database load failed, resetting:", error);
    const initialState: AppState = {
      menuMaster: INITIAL_MENU,
      dailyInventory: INITIAL_INVENTORY,
      orders: INITIAL_ORDERS,
      cart: [],
      staffPin: '1234',
      adminMobile: '9876543210',
      paymentConfig: { upiId: 'bansalcanteen@upi', merchantName: 'Bansal Canteen' }
    };
    saveDB(initialState, false);
    return initialState;
  }
};

const saveDB = (state: AppState, shouldBroadcast = true) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
  if (shouldBroadcast) {
    broadcastChannel.postMessage('state_updated');
  }
};

// --- API Methods ---

export const getAppState = (): AppState => loadDB();

export const subscribeToUpdates = (callback: () => void) => {
  broadcastChannel.onmessage = (event) => {
    if (event.data === 'state_updated') {
      callback();
    }
  };
};

export const placeOrder = (items: CartItem[], total: number, mode: PaymentMode): Order => {
  const db = loadDB();
  
  // Decrement Stock
  items.forEach(item => {
    const stock = db.dailyInventory[item.id];
    if (stock && stock.trackStock) {
      db.dailyInventory[item.id] = {
        ...stock,
        stockQty: Math.max(0, stock.stockQty - item.qty)
      };
    }
  });

  // Generate Token (Reset daily)
  const now = new Date();
  const todayString = now.toDateString(); // e.g. "Fri Nov 28 2025"

  const todayOrders = db.orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.toDateString() === todayString;
  });
  
  // Start from 101, then increment
  const tokenNumber = 101 + todayOrders.length;

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    tokenNumber,
    items,
    totalAmount: total,
    paymentMode: mode,
    status: mode === PaymentMode.ONLINE ? OrderStatus.CONFIRMED : OrderStatus.AWAITING_CASH,
    createdAt: Date.now(),
  };

  db.orders.push(newOrder);
  db.cart = []; // Clear cart after order
  saveDB(db);
  return newOrder;
};

export const updateCart = (cart: CartItem[]) => {
  const db = loadDB();
  db.cart = cart;
  saveDB(db);
};

export const updateOrderStatus = (orderId: string, status: OrderStatus) => {
  const db = loadDB();
  const orderIndex = db.orders.findIndex(o => o.id === orderId);
  if (orderIndex > -1) {
    db.orders[orderIndex].status = status;
    saveDB(db);
  }
};

export const updateDailyStock = (itemId: string, updates: Partial<DailyStock>) => {
  const db = loadDB();
  if (db.dailyInventory[itemId]) {
    db.dailyInventory[itemId] = { ...db.dailyInventory[itemId], ...updates };
  } else {
    // Initialize if missing
    db.dailyInventory[itemId] = { itemId, available: true, stockQty: 0, trackStock: true, ...updates };
  }
  saveDB(db);
};

export const updateMenuItem = (item: MenuItem) => {
    const db = loadDB();
    const idx = db.menuMaster.findIndex(m => m.id === item.id);
    if(idx > -1) {
        db.menuMaster[idx] = item;
    } else {
        db.menuMaster.push(item);
        // Also init inventory
        db.dailyInventory[item.id] = { itemId: item.id, available: true, stockQty: 20, trackStock: true };
    }
    saveDB(db);
};

export const addNewMenuItem = (name: string, price: number, image: string, category: string) => {
    const db = loadDB();
    const newId = `m${Date.now()}`; // Simple ID generation
    const newItem: MenuItem = {
        id: newId,
        name,
        basePrice: price,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60', // Fallback
        category,
        description: 'Newly added item.'
    };
    db.menuMaster.push(newItem);
    db.dailyInventory[newId] = {
        itemId: newId,
        available: true,
        stockQty: 50,
        trackStock: true
    };
    saveDB(db);
};

export const updateStaffPin = (newPin: string) => {
  const db = loadDB();
  db.staffPin = newPin;
  saveDB(db);
};

export const updateAdminMobile = (newMobile: string) => {
    const db = loadDB();
    db.adminMobile = newMobile;
    saveDB(db);
};

export const updatePaymentConfig = (config: PaymentConfig) => {
    const db = loadDB();
    db.paymentConfig = config;
    saveDB(db);
};

// Helper for Google Gemini usage
export const getMenuNames = () => {
    const db = loadDB();
    return db.menuMaster.map(m => m.name).join(', ');
}
