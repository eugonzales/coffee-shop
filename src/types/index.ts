export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  favoriteItems: string[];
  createdAt: string;
  address?: string;
  phone?: string;
  location?: UserLocation;
  isActive: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface Coffee {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image: string;
  ingredients: string[];
  customizable: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'milk' | 'syrup' | 'extra';
  lowStockThreshold: number;
}

export interface IngredientOption {
  id: string;
  name: string;
  price: number;
  category: Ingredient['category'];
}

export interface CartItem {
  id: string;
  coffeeId: string;
  coffeeName: string;
  basePrice: number;
  customIngredients: string[];
  totalPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  paymentMethod: string;
  orderType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  tip: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}