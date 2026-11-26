export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  favorite_items: string[];
  address: string | null;
  phone: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  created_at: string;
};

type CoffeeRow = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  image: string;
  ingredients: string[];
  customizable: boolean;
};

type IngredientRow = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'milk' | 'syrup' | 'extra';
  low_stock_threshold: number;
};

type OrderRow = {
  id: string;
  user_id: string;
  items: Json;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  payment_method: string;
  order_type: 'pickup' | 'delivery';
  delivery_address: string | null;
  tip: number;
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Pick<ProfileRow, 'id' | 'email' | 'full_name'> & Partial<ProfileRow>,
        Partial<ProfileRow>
      >;
      coffees: Table<CoffeeRow, Omit<CoffeeRow, 'id'> & { id?: string }, Partial<CoffeeRow>>;
      ingredients: Table<IngredientRow, Omit<IngredientRow, 'id'> & { id?: string }, Partial<IngredientRow>>;
      orders: Table<OrderRow, Omit<OrderRow, 'id' | 'created_at'> & { id?: string; created_at?: string }, Partial<OrderRow>>;
    };
    Views: {
      ingredient_options: {
        Row: Pick<IngredientRow, 'id' | 'name' | 'price' | 'category'>;
        Relationships: [];
      };
    };
    Functions: {
      place_order: {
        Args: {
          p_items: Json;
          p_payment_method: string;
          p_order_type: 'pickup' | 'delivery';
          p_delivery_address: string | null;
          p_tip: number;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
