import { CartItem, Coffee, Ingredient, IngredientOption, Order, User } from '../types';
import { Database, Json } from '../lib/database.types';
import { getSupabase } from '../lib/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type CoffeeRow = Database['public']['Tables']['coffees']['Row'];
type IngredientRow = Database['public']['Tables']['ingredients']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];

const mapProfile = (profile: ProfileRow): User => ({
  id: profile.id,
  email: profile.email,
  name: profile.full_name,
  role: profile.role,
  favoriteItems: profile.favorite_items,
  createdAt: profile.created_at,
  address: profile.address ?? undefined,
  phone: profile.phone ?? undefined,
  location: typeof profile.location_latitude === 'number' && typeof profile.location_longitude === 'number'
    ? { latitude: profile.location_latitude, longitude: profile.location_longitude }
    : undefined,
  isActive: profile.is_active,
});

const mapCoffee = (coffee: CoffeeRow): Coffee => ({
  id: coffee.id,
  name: coffee.name,
  description: coffee.description,
  basePrice: Number(coffee.base_price),
  category: coffee.category,
  image: coffee.image,
  ingredients: coffee.ingredients,
  customizable: coffee.customizable,
});

const mapIngredient = (ingredient: IngredientRow): Ingredient => ({
  id: ingredient.id,
  name: ingredient.name,
  price: Number(ingredient.price),
  stock: ingredient.stock,
  category: ingredient.category,
  lowStockThreshold: ingredient.low_stock_threshold,
});

const parseCartItems = (value: Json): CartItem[] => {
  if (!Array.isArray(value)) {
    throw new Error('The saved order contains invalid item data.');
  }

  return value.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error('The saved order contains invalid item data.');
    }
    const row = item as Record<string, Json | undefined>;
    if (
      typeof row.id !== 'string'
      || typeof row.coffeeId !== 'string'
      || typeof row.coffeeName !== 'string'
      || typeof row.basePrice !== 'number'
      || !Array.isArray(row.customIngredients)
      || !row.customIngredients.every(ingredient => typeof ingredient === 'string')
      || typeof row.totalPrice !== 'number'
      || typeof row.quantity !== 'number'
    ) {
      throw new Error('The saved order contains invalid item data.');
    }
    return {
      id: row.id,
      coffeeId: row.coffeeId,
      coffeeName: row.coffeeName,
      basePrice: row.basePrice,
      customIngredients: row.customIngredients,
      totalPrice: row.totalPrice,
      quantity: row.quantity,
    };
  });
};

const mapOrder = (order: OrderRow): Order => ({
  id: order.id,
  userId: order.user_id,
  items: parseCartItems(order.items),
  total: Number(order.total),
  status: order.status,
  createdAt: order.created_at,
  paymentMethod: order.payment_method,
  orderType: order.order_type,
  deliveryAddress: order.delivery_address ?? undefined,
  tip: Number(order.tip),
});

const isOrderStatus = (status: string): status is OrderRow['status'] =>
  status === 'pending' || status === 'completed' || status === 'cancelled';

const isOrderType = (orderType: string): orderType is OrderRow['order_type'] =>
  orderType === 'pickup' || orderType === 'delivery';

const getSingle = <T>(data: T | null, error: { message: string } | null): T => {
  if (error) throw new Error(error.message);
  if (!data) throw new Error('The requested record was not found.');
  return data;
};

export const getProfile = async (userId: string): Promise<User> => {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return mapProfile(getSingle(data, error));
};

export const getCoffees = async (): Promise<Coffee[]> => {
  const { data, error } = await getSupabase()
    .from('coffees')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return data.map(mapCoffee);
};

export const createCoffee = async (coffee: Coffee): Promise<Coffee> => {
  const { data, error } = await getSupabase()
    .from('coffees')
    .insert({
      id: coffee.id,
      name: coffee.name,
      description: coffee.description,
      base_price: coffee.basePrice,
      category: coffee.category,
      image: coffee.image,
      ingredients: coffee.ingredients,
      customizable: coffee.customizable,
    })
    .select()
    .single();
  return mapCoffee(getSingle(data, error));
};

export const updateCoffee = async (coffee: Coffee): Promise<Coffee> => {
  const { data, error } = await getSupabase()
    .from('coffees')
    .update({
      name: coffee.name,
      description: coffee.description,
      base_price: coffee.basePrice,
      category: coffee.category,
      image: coffee.image,
      ingredients: coffee.ingredients,
      customizable: coffee.customizable,
    })
    .eq('id', coffee.id)
    .select()
    .single();
  return mapCoffee(getSingle(data, error));
};

export const deleteCoffee = async (coffeeId: string): Promise<void> => {
  const { error } = await getSupabase().from('coffees').delete().eq('id', coffeeId);
  if (error) throw new Error(error.message);
};

export const getIngredientOptions = async (): Promise<IngredientOption[]> => {
  const { data, error } = await getSupabase()
    .from('ingredient_options')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return data;
};

export const getIngredients = async (): Promise<Ingredient[]> => {
  const { data, error } = await getSupabase()
    .from('ingredients')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return data.map(mapIngredient);
};

export const updateIngredient = async (
  ingredientId: string,
  changes: Pick<Ingredient, 'stock' | 'lowStockThreshold'>,
): Promise<Ingredient> => {
  const { data, error } = await getSupabase()
    .from('ingredients')
    .update({
      stock: changes.stock,
      low_stock_threshold: changes.lowStockThreshold,
    })
    .eq('id', ingredientId)
    .select()
    .single();
  return mapIngredient(getSingle(data, error));
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapOrder);
};

export const getAdminOrders = async (): Promise<Order[]> => {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapOrder);
};

export const placeOrder = async (
  items: CartItem[],
  paymentMethod: string,
  orderType: 'pickup' | 'delivery',
  deliveryAddress: string | null,
  tip: number,
): Promise<Order> => {
  const { data, error } = await getSupabase().rpc('place_order', {
    p_items: items.map(item => ({
      id: item.id,
      coffeeId: item.coffeeId,
      coffeeName: item.coffeeName,
      basePrice: item.basePrice,
      customIngredients: item.customIngredients,
      totalPrice: item.totalPrice,
      quantity: item.quantity,
    })),
    p_payment_method: paymentMethod,
    p_order_type: orderType,
    p_delivery_address: deliveryAddress,
    p_tip: tip,
  });
  if (error) throw new Error(error.message);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('The order was submitted but the server returned invalid order data.');
  }

  const row = data as Record<string, Json | undefined>;
  if (
    typeof row.id !== 'string'
    || typeof row.user_id !== 'string'
    || typeof row.total !== 'number'
    || typeof row.status !== 'string'
    || !isOrderStatus(row.status)
    || typeof row.created_at !== 'string'
    || typeof row.payment_method !== 'string'
    || typeof row.order_type !== 'string'
    || !isOrderType(row.order_type)
    || typeof row.tip !== 'number'
    || !row.items
  ) {
    throw new Error('The server returned an incomplete order record.');
  }

  return mapOrder({
    id: row.id,
    user_id: row.user_id,
    items: row.items,
    total: row.total,
    status: row.status,
    created_at: row.created_at,
    payment_method: row.payment_method,
    order_type: row.order_type,
    delivery_address: typeof row.delivery_address === 'string' ? row.delivery_address : null,
    tip: row.tip,
  });
};

export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
): Promise<void> => {
  const { error } = await getSupabase()
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
};

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(mapProfile);
};

export const setUserActive = async (userId: string, isActive: boolean): Promise<void> => {
  const { error } = await getSupabase()
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);
  if (error) throw new Error(error.message);
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/?reset-password=1`,
  });
  if (error) throw new Error(error.message);
};

export const uploadMenuImage = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;
  const { data, error } = await getSupabase()
    .storage
    .from('menu-images')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return getSupabase().storage.from('menu-images').getPublicUrl(data.path).data.publicUrl;
};
