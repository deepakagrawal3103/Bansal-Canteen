
import { MenuItem, DailyStock, Order } from './types';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Maggi',
    description: 'Hot & spicy masala maggi noodles.',
    basePrice: 50,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'm2',
    name: 'Chole Bhature',
    description: 'Fluffy bhature with spicy chole masala.',
    basePrice: 60,
    category: 'Meals',
    image: 'https://lh5.googleusercontent.com/proxy/MRM9rtKGvv9Nsc5CLx4soi5Qh8ojzjw25zmYUjWMHv8dKnV6bRt6w2RJIpRKappin9EP5zCh-bhLSFhjNUmsqXEeC4igJ_Glf5glffRRtG4UAso2Hw',
  },
  {
    id: 'm3',
    name: 'Aalu Paratha',
    description: 'Stuffed potato paratha with pickle & curd.',
    basePrice: 30,
    category: 'Meals',
    image: 'https://www.vegrecipesofindia.com/wp-content/uploads/2009/08/aloo-paratha-recipe-2.jpg',
  },
  {
    id: 'm4',
    name: 'Samosa',
    description: 'Crispy golden pastry with spicy potato filling.',
    basePrice: 12,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'm5',
    name: 'Back Samosa',
    description: 'Special canteen version crispy samosa.',
    basePrice: 25,
    category: 'Snacks',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD9vtIwbFFlhDiHONHvirQ5KnXQUr7BrUypA&s',
  },
  {
    id: 'm6',
    name: 'Poha',
    description: 'Light flattened rice with peanuts and coriander.',
    basePrice: 10,
    category: 'Breakfast',
    image: 'https://www.sharmispassions.com/wp-content/uploads/2022/01/PohaRecipe5-500x500.jpg', 
  },
];

export const INITIAL_INVENTORY: Record<string, DailyStock> = {
  'm1': { itemId: 'm1', available: true, stockQty: 50, trackStock: true },
  'm2': { itemId: 'm2', available: true, stockQty: 30, trackStock: true },
  'm3': { itemId: 'm3', available: true, stockQty: 100, trackStock: false }, // No stock tracking requested
  'm4': { itemId: 'm4', available: true, stockQty: 100, trackStock: true },
  'm5': { itemId: 'm5', available: true, stockQty: 20, trackStock: true },
  'm6': { itemId: 'm6', available: true, stockQty: 80, trackStock: true },
};

// Initial empty orders
export const INITIAL_ORDERS: Order[] = [];
