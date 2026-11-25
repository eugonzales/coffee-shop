import { User, Coffee, Ingredient, Order } from '../types';

const STORAGE_KEYS = {
  USERS: 'coffee_shop_users',
  COFFEES: 'coffee_shop_coffees',
  INGREDIENTS: 'coffee_shop_ingredients',
  ORDERS: 'coffee_shop_orders',
  CURRENT_USER: 'coffee_shop_current_user',
  CART: 'coffee_shop_cart',
};

const ADMIN_EMAIL = 'admin@miakape.test';
const LEGACY_ADMIN_EMAIL = 'admin@beanbrewph.com';

// Default data
const defaultCoffees: Coffee[] = [
  {
    id: '1',
    name: 'Classic Espresso',
    description: 'Rich and bold single shot of espresso made from premium Arabica beans',
    basePrice: 120,
    category: 'Espresso',
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
    ingredients: ['espresso'],
    customizable: true,
  },
  {
    id: '2',
    name: 'Cappuccino',
    description: 'Perfect balance of espresso, steamed milk, and velvety foam',
    basePrice: 180,
    category: 'Coffee',
    image: 'https://images.pexels.com/photos/1470165/pexels-photo-1470165.jpeg?auto=compress&cs=tinysrgb&w=400',
    ingredients: ['espresso', 'milk'],
    customizable: true,
  },
  {
    id: '3',
    name: 'Caramel Macchiato',
    description: 'Espresso with steamed milk, vanilla syrup, and rich caramel drizzle',
    basePrice: 250,
    category: 'Specialty',
    image: 'https://images.pexels.com/photos/1233648/pexels-photo-1233648.jpeg?auto=compress&cs=tinysrgb&w=400',
    ingredients: ['espresso', 'milk', 'caramel syrup'],
    customizable: true,
  },
  {
    id: '4',
    name: 'Vanilla Latte',
    description: 'Smooth espresso with steamed milk and aromatic vanilla syrup',
    basePrice: 220,
    category: 'Latte',
    image: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg?auto=compress&cs=tinysrgb&w=400',
    ingredients: ['espresso', 'milk', 'vanilla syrup'],
    customizable: true,
  },
  {
    id: '5',
    name: 'Iced Americano',
    description: 'Refreshing cold espresso with water over ice',
    basePrice: 150,
    category: 'Cold Brew',
    image: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=400',
    ingredients: ['espresso', 'water'],
    customizable: true,
  },
  {
    id: '6',
    name: 'Mocha Frappuccino',
    description: 'Blended coffee with chocolate syrup, milk, and whipped cream',
    basePrice: 280,
    category: 'Specialty',
    image: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=400',
    ingredients: ['espresso', 'milk', 'chocolate syrup', 'whipped cream'],
    customizable: true,
  },
];

const defaultIngredients: Ingredient[] = [
  { id: '1', name: 'Whole Milk', price: 25, stock: 100, category: 'milk', lowStockThreshold: 20 },
  { id: '2', name: 'Oat Milk', price: 35, stock: 50, category: 'milk', lowStockThreshold: 10 },
  { id: '3', name: 'Almond Milk', price: 30, stock: 45, category: 'milk', lowStockThreshold: 10 },
  { id: '4', name: 'Coconut Milk', price: 30, stock: 40, category: 'milk', lowStockThreshold: 10 },
  { id: '5', name: 'Vanilla Syrup', price: 20, stock: 80, category: 'syrup', lowStockThreshold: 15 },
  { id: '6', name: 'Caramel Syrup', price: 20, stock: 75, category: 'syrup', lowStockThreshold: 15 },
  { id: '7', name: 'Hazelnut Syrup', price: 25, stock: 60, category: 'syrup', lowStockThreshold: 15 },
  { id: '8', name: 'Chocolate Syrup', price: 25, stock: 65, category: 'syrup', lowStockThreshold: 15 },
  { id: '9', name: 'Extra Shot', price: 40, stock: 200, category: 'extra', lowStockThreshold: 30 },
  { id: '10', name: 'Whipped Cream', price: 25, stock: 40, category: 'extra', lowStockThreshold: 10 },
  { id: '11', name: 'Cinnamon Powder', price: 15, stock: 50, category: 'extra', lowStockThreshold: 10 },
];

const defaultAdmin: User = {
  id: 'admin-1',
  email: ADMIN_EMAIL,
  password: 'admin123',
  name: 'Coffee Shop Administrator',
  role: 'admin',
  favoriteItems: [],
  createdAt: new Date().toISOString(),
};

export const initializeData = () => {
  // Always ensure admin exists
  const existingUsers = getUsers();
  const adminExists = existingUsers.some(user => user.email === ADMIN_EMAIL);

  if (!adminExists) {
    const legacyAdminIndex = existingUsers.findIndex(
      user => user.email === LEGACY_ADMIN_EMAIL && user.role === 'admin',
    );

    if (legacyAdminIndex !== -1) {
      const migratedAdmin = { ...existingUsers[legacyAdminIndex], email: ADMIN_EMAIL };
      existingUsers[legacyAdminIndex] = migratedAdmin;
      saveUsers(existingUsers);

      const currentUser = getCurrentUser();
      if (currentUser?.id === migratedAdmin.id) {
        saveCurrentUser(migratedAdmin);
      }
    } else {
      saveUsers([...existingUsers, defaultAdmin]);
    }
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.COFFEES)) {
    localStorage.setItem(STORAGE_KEYS.COFFEES, JSON.stringify(defaultCoffees));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INGREDIENTS)) {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(defaultIngredients));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultAdmin]));
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getCoffees = (): Coffee[] => {
  const coffees = localStorage.getItem(STORAGE_KEYS.COFFEES);
  return coffees ? JSON.parse(coffees) : [];
};

export const saveCoffees = (coffees: Coffee[]) => {
  localStorage.setItem(STORAGE_KEYS.COFFEES, JSON.stringify(coffees));
};

export const getIngredients = (): Ingredient[] => {
  const ingredients = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
  return ingredients ? JSON.parse(ingredients) : [];
};

export const saveIngredients = (ingredients: Ingredient[]) => {
  localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
};

export const getOrders = (): Order[] => {
  const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return orders ? JSON.parse(orders) : [];
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getCart = (): any[] => {
  const cart = localStorage.getItem(STORAGE_KEYS.CART);
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: any[]) => {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
};

export const clearCart = () => {
  localStorage.removeItem(STORAGE_KEYS.CART);
};