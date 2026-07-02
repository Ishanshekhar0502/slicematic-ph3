-- Schema for SliceMatic Stage 3 Ordering System

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('customer', 'admin')) default 'customer',
  name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- 2. MENUS TABLE
create table if not exists public.menus (
  id text primary key, -- Using text IDs like 'base_1', 'pizza_1' or raw '1', '2'
  category text not null check (category in ('base', 'pizza', 'topping')),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.menus enable row level security;

-- 3. ORDERS TABLE
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  payment_mode text not null check (payment_mode in ('Cash', 'Card', 'UPI')),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount numeric(10,2) not null check (discount >= 0),
  gst numeric(10,2) not null check (gst >= 0),
  final_total numeric(10,2) not null check (final_total >= 0),
  status text not null check (status in ('pending', 'preparing', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.orders enable row level security;

-- 4. ORDER LINE ITEMS TABLE
create table if not exists public.order_line_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  menu_item_id text references public.menus(id) on delete set null,
  category text not null check (category in ('base', 'pizza', 'topping')),
  item_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_number integer not null -- To group base, pizza, topping parts of one combo
);

-- Enable RLS
alter table public.order_line_items enable row level security;

-- ── helper functions for RLS ──────────────────────────────────────────────────

-- Function to check if a user is an admin without infinite recursion
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;

-- ── RLS Policies ─────────────────────────────────────────────────────────────

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());

-- Menus policies
create policy "Anyone can view menu items"
  on public.menus for select
  using (true);

create policy "Admins can manage menu items"
  on public.menus for all
  using (public.is_admin());

-- Orders policies
create policy "Customers can view their own orders"
  on public.orders for select
  using (auth.uid() = customer_id);

create policy "Customers can place their own orders"
  on public.orders for insert
  with check (auth.uid() = customer_id);

create policy "Admins can manage all orders"
  on public.orders for all
  using (public.is_admin());

-- Order Line Items policies
create policy "Customers can view their own order line items"
  on public.order_line_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_line_items.order_id
      and orders.customer_id = auth.uid()
    )
  );

create policy "Customers can insert their own order line items"
  on public.order_line_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_line_items.order_id
      and orders.customer_id = auth.uid()
    )
  );

create policy "Admins can manage all order line items"
  on public.order_line_items for all
  using (public.is_admin());

-- ── Triggers ──────────────────────────────────────────────────────────────────

-- Automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case 
      -- Auto-grant admin role for @slicematic.com emails
      when new.email like '%@slicematic.com' then 'admin'
      else 'customer'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Seed Data ─────────────────────────────────────────────────────────────────

-- Bases
insert into public.menus (id, category, name, price, description) values
  ('base_1', 'base', 'Thin Crust', 149.00, 'Light, crispy, and baked to perfection'),
  ('base_2', 'base', 'Thick Crust', 179.00, 'Soft, fluffy, and thick dough'),
  ('base_3', 'base', 'Cheese Burst', 229.00, 'Liquid cheese flowing inside the crust'),
  ('base_4', 'base', 'Whole Wheat', 169.00, 'Healthy wheat base with a rustic bite'),
  ('base_5', 'base', 'Multigrain', 199.00, 'Fibre-rich, multi-grain wholesome base');

-- Pizzas
insert into public.menus (id, category, name, price, description) values
  ('pizza_1', 'pizza', 'Margherita', 299.00, 'Classic tomato sauce, fresh mozzarella, and basil'),
  ('pizza_2', 'pizza', 'Chicago Deep Dish', 359.00, 'Indulgent deep crust layered with chunky sauce and cheese'),
  ('pizza_3', 'pizza', 'Greek Mediterranean', 339.00, 'Topped with feta, olives, red onions, and bell peppers'),
  ('pizza_4', 'pizza', 'Farm House', 319.00, 'Loaded with capsicum, onion, mushroom, and tomato'),
  ('pizza_5', 'pizza', 'Pepperoni Classic', 379.00, 'Crispy pepperoni slices with premium mozzarella'),
  ('pizza_6', 'pizza', 'BBQ Chicken', 369.00, 'Smoky sweet BBQ chicken with red onions'),
  ('pizza_7', 'pizza', 'Paneer Tikka', 329.00, 'Indian fusion pizza with spiced paneer, onions, and capsicum'),
  ('pizza_8', 'pizza', 'California Veggie', 309.00, 'Garden fresh broccoli, corn, zucchini, and olives');

-- Toppings
insert into public.menus (id, category, name, price, description) values
  ('topping_1', 'topping', 'Black Olives', 39.00, 'Sliced Spanish black olives'),
  ('topping_2', 'topping', 'Extra Cheese', 59.00, 'Gooey stringy mozzarella cheese'),
  ('topping_3', 'topping', 'Mushrooms', 49.00, 'Freshly sliced button mushrooms'),
  ('topping_4', 'topping', 'Green Peppers', 39.00, 'Crisp green bell pepper slices'),
  ('topping_5', 'topping', 'Jalapenos', 39.00, 'Pickled spicy jalapeno peppers'),
  ('topping_6', 'topping', 'Sun-Dried Tomatoes', 59.00, 'Rich sweet sun-dried tomatoes'),
  ('topping_7', 'topping', 'Caramelised Onions', 49.00, 'Slow cooked sweet brown onions'),
  ('topping_8', 'topping', 'Sweet Corn', 39.00, 'Juicy sweet American corn kernels'),
  ('topping_9', 'topping', 'Roasted Garlic', 49.00, 'Soft aromatic roasted garlic cloves'),
  ('topping_10', 'topping', 'Peri-Peri Drizzle', 69.00, 'Spicy peri-peri mayo drizzle across the top');
