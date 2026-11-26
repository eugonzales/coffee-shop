create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  is_active boolean not null default true,
  favorite_items text[] not null default '{}',
  address text,
  phone text,
  location_latitude double precision check (location_latitude between -90 and 90),
  location_longitude double precision check (location_longitude between -180 and 180),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists location_latitude double precision check (location_latitude between -90 and 90);
alter table public.profiles
  add column if not exists location_longitude double precision check (location_longitude between -180 and 180);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_location_coordinates_pair_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_location_coordinates_pair_check
      check ((location_latitude is null) = (location_longitude is null));
  end if;
end;
$$;

create table if not exists public.coffees (
  id text primary key,
  name text not null,
  description text not null default '',
  base_price numeric(10, 2) not null check (base_price >= 0),
  category text not null,
  image text not null default '',
  ingredients text[] not null default '{}',
  customizable boolean not null default true
);

create table if not exists public.ingredients (
  id text primary key,
  name text not null unique,
  price numeric(10, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  category text not null check (category in ('milk', 'syrup', 'extra')),
  low_stock_threshold integer not null default 0 check (low_stock_threshold >= 0)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  payment_method text not null,
  order_type text not null check (order_type in ('pickup', 'delivery')),
  delivery_address text,
  tip numeric(10, 2) not null default 0 check (tip >= 0)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active
  );
$$;

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_auth_user();

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute procedure public.sync_profile_email();

create or replace function public.guard_profile_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
    and auth.role() = 'authenticated'
    and not public.is_admin() then
    raise exception 'Only an administrator can change profile permissions';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_permissions_changed on public.profiles;
create trigger on_profile_permissions_changed
  before update on public.profiles
  for each row execute procedure public.guard_profile_permissions();

alter table public.profiles enable row level security;
alter table public.coffees enable row level security;
alter table public.ingredients enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Users read own profile and admins read all" on public.profiles;
create policy "Users read own profile and admins read all"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "Users update own profile and admins update all" on public.profiles;
create policy "Users update own profile and admins update all"
  on public.profiles for update to authenticated
  using ((id = auth.uid() and public.is_active_user()) or public.is_admin())
  with check ((id = auth.uid() and public.is_active_user()) or public.is_admin());

drop policy if exists "Anyone can read the coffee menu" on public.coffees;
create policy "Anyone can read the coffee menu"
  on public.coffees for select to anon, authenticated using (true);

drop policy if exists "Admins manage the coffee menu" on public.coffees;
create policy "Admins manage the coffee menu"
  on public.coffees for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read inventory" on public.ingredients;
create policy "Admins read inventory"
  on public.ingredients for select to authenticated using (public.is_admin());

drop policy if exists "Admins manage inventory" on public.ingredients;
create policy "Admins manage inventory"
  on public.ingredients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Customers read their orders and admins read all" on public.orders;
create policy "Customers read their orders and admins read all"
  on public.orders for select to authenticated
  using ((user_id = auth.uid() and public.is_active_user()) or public.is_admin());

drop policy if exists "Admins update order status" on public.orders;
create policy "Admins update order status"
  on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace view public.ingredient_options as
  select id, name, price, category
  from public.ingredients
  where stock > 0;

grant select on public.coffees to anon, authenticated;
grant select on public.ingredient_options to anon, authenticated;
grant select on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (full_name, favorite_items, address, phone, location_latitude, location_longitude, is_active)
  on public.profiles to authenticated;
grant select, insert, update, delete on public.coffees to authenticated;
grant select, update on public.ingredients to authenticated;
grant select, update on public.orders to authenticated;

create or replace function public.place_order(
  p_items jsonb,
  p_payment_method text,
  p_order_type text,
  p_delivery_address text,
  p_tip numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_coffee public.coffees%rowtype;
  v_order public.orders%rowtype;
  v_custom_names text[];
  v_ingredient_name text;
  v_coffee_id text;
  v_quantity integer;
  v_found_count integer;
  v_custom_price numeric;
  v_unit_price numeric;
  v_total numeric := 0;
  v_items jsonb := '[]'::jsonb;
begin
  if auth.uid() is null or not public.is_active_user() then
    raise exception 'You must be signed in to place an order';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one item';
  end if;
  if p_payment_method not in ('card', 'cash', 'gcash', 'paymaya') then
    raise exception 'Invalid payment method';
  end if;
  if p_order_type not in ('pickup', 'delivery') then
    raise exception 'Invalid order type';
  end if;
  if p_order_type = 'delivery' and coalesce(trim(p_delivery_address), '') = '' then
    raise exception 'A delivery address is required';
  end if;
  if p_tip < 0 then
    raise exception 'Tip cannot be negative';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) as input_items(value)
  loop
    v_coffee_id := v_item ->> 'coffeeId';
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 0);
    if v_quantity < 1 then
      raise exception 'Invalid item quantity';
    end if;

    select * into v_coffee from public.coffees where id = v_coffee_id;
    if not found then
      raise exception 'A menu item in this order no longer exists';
    end if;

    select coalesce(array_agg(distinct value), '{}'::text[])
      into v_custom_names
      from jsonb_array_elements_text(coalesce(v_item -> 'customIngredients', '[]'::jsonb)) as custom_items(value);

    select count(*), coalesce(sum(price), 0)
      into v_found_count, v_custom_price
      from public.ingredients
      where name = any(v_custom_names);
    if v_found_count <> cardinality(v_custom_names) then
      raise exception 'A selected customization is no longer available';
    end if;

    v_unit_price := v_coffee.base_price + v_custom_price;
    v_total := v_total + (v_unit_price * v_quantity);
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'id', coalesce(v_item ->> 'id', gen_random_uuid()::text),
      'coffeeId', v_coffee.id,
      'coffeeName', v_coffee.name,
      'basePrice', v_coffee.base_price,
      'customIngredients', to_jsonb(v_custom_names),
      'totalPrice', v_unit_price,
      'quantity', v_quantity
    ));

    for v_ingredient_name in
      select distinct case
        when lower(ingredient_name) = 'milk' then 'whole milk'
        else lower(ingredient_name)
      end
      from unnest(v_coffee.ingredients || v_custom_names) as used_ingredients(ingredient_name)
    loop
      update public.ingredients
      set stock = stock - v_quantity
      where lower(name) = v_ingredient_name
        and stock >= v_quantity;
      if not found and exists (
        select 1 from public.ingredients where lower(name) = v_ingredient_name
      ) then
        raise exception 'Not enough stock of %', v_ingredient_name;
      end if;
    end loop;
  end loop;

  v_total := v_total + case when p_order_type = 'delivery' then 50 else 0 end + p_tip;
  insert into public.orders (
    user_id, items, total, status, payment_method, order_type, delivery_address, tip
  ) values (
    auth.uid(),
    v_items,
    v_total,
    'pending',
    p_payment_method,
    p_order_type,
    case when p_order_type = 'delivery' then trim(p_delivery_address) else null end,
    p_tip
  )
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

grant execute on function public.place_order(jsonb, text, text, text, numeric) to authenticated;

insert into public.coffees (id, name, description, base_price, category, image, ingredients, customizable)
values
  ('1', 'Classic Espresso', 'Rich and bold single shot of espresso made from premium Arabica beans', 120, 'Espresso', '/images/nathan-dumlao-nBJHO6wmRWw-unsplash.jpg', array['espresso'], true),
  ('2', 'Cappuccino', 'Perfect balance of espresso, steamed milk, and velvety foam', 180, 'Coffee', '/images/fahmi-fakhrudin-nzyzAUsbV0M-unsplash.jpg', array['espresso', 'milk'], true),
  ('3', 'Caramel Macchiato', 'Espresso with steamed milk, vanilla syrup, and rich caramel drizzle', 250, 'Specialty', '/images/nameless-3791-5nYLHK68TLM-unsplash.jpg', array['espresso', 'milk', 'caramel syrup'], true),
  ('4', 'Vanilla Latte', 'Smooth espresso with steamed milk and aromatic vanilla syrup', 220, 'Latte', '/images/emmanuel-lozano-vmpk4_yPtRA-unsplash.jpg', array['espresso', 'milk', 'vanilla syrup'], true),
  ('5', 'Iced Americano', 'Refreshing cold espresso with water over ice', 150, 'Cold Brew', '/images/nathan-dumlao-XOhI_kW_TaM-unsplash.jpg', array['espresso', 'water'], true),
  ('6', 'Mocha Frappuccino', 'Blended coffee with chocolate syrup, milk, and whipped cream', 280, 'Specialty', '/images/jarek-ceborski-IhqDpFz7I8Q-unsplash.jpg', array['espresso', 'milk', 'chocolate syrup', 'whipped cream'], true)
on conflict (id) do nothing;

insert into public.ingredients (id, name, price, stock, category, low_stock_threshold)
values
  ('1', 'Whole Milk', 25, 100, 'milk', 20),
  ('2', 'Oat Milk', 35, 50, 'milk', 10),
  ('3', 'Almond Milk', 30, 45, 'milk', 10),
  ('4', 'Coconut Milk', 30, 40, 'milk', 10),
  ('5', 'Vanilla Syrup', 20, 80, 'syrup', 15),
  ('6', 'Caramel Syrup', 20, 75, 'syrup', 15),
  ('7', 'Hazelnut Syrup', 25, 60, 'syrup', 15),
  ('8', 'Chocolate Syrup', 25, 65, 'syrup', 15),
  ('9', 'Extra Shot', 40, 200, 'extra', 30),
  ('10', 'Whipped Cream', 25, 40, 'extra', 10),
  ('11', 'Cinnamon Powder', 15, 50, 'extra', 10)
on conflict (id) do nothing;

-- After registering the shop-owner account, promote it once in the SQL Editor:
-- update public.profiles set role = 'admin' where email = 'owner@example.com';

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read menu images" on storage.objects;
create policy "Public can read menu images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'menu-images');

drop policy if exists "Admins manage menu images" on storage.objects;
create policy "Admins manage menu images"
  on storage.objects for all to authenticated
  using (bucket_id = 'menu-images' and public.is_admin())
  with check (bucket_id = 'menu-images' and public.is_admin());
