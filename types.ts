
export enum PaymentMode {
  ONLINE = 'ONLINE',
  CASH_DESK = 'CASH_DESK',
}

export enum OrderStatus {
  AWAITING_CASH = 'AWAITING_CASH', // User selected Cash, needs staff approval
  CONFIRMED = 'CONFIRMED',         // Paid (online) or Cash Approved
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  image: string;
  category: string;
}

export interface DailyStock {
  itemId: string;
  available: boolean; // Is it on the menu today?
  stockQty: number;   // 0 = out of stock
  trackStock: boolean;
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface Order {
  id: string;
  tokenNumber: number;
  items: CartItem[];
  totalAmount: number;
  paymentMode: PaymentMode;
  status: OrderStatus;
  createdAt: number; // timestamp
  studentName?: string; // Optional, usually anon
}

export interface PaymentConfig {
  upiId: string;
  merchantName: string;
}

export interface AppState {
  menuMaster: MenuItem[];
  dailyInventory: Record<string, DailyStock>;
  orders: Order[];
  cart: CartItem[];
  staffPin: string;      // For PIN Reset feature
  adminMobile: string;   // Registered mobile for recovery
  paymentConfig: PaymentConfig; // Store payment details
}
