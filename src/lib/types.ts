export interface MenuItem {
  id: string;
  category: 'base' | 'pizza' | 'topping';
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface CartItem {
  base: MenuItem;
  pizza: MenuItem;
  topping: MenuItem | null;
  qty: number;
}

export interface BillSummary {
  lineSubtotals: number[];
  totalQty: number;
  subtotal: number;
  discount: number;
  postDiscount: number;
  gst: number;
  finalTotal: number;
}

export interface Profile {
  id: string;
  role: 'customer' | 'admin';
  name: string | null;
  phone: string | null;
  created_at: string;
}

export interface OrderLineItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  category: 'base' | 'pizza' | 'topping';
  item_name: string;
  unit_price: number;
  quantity: number;
  line_number: number;
}

export interface Order {
  id: string;
  customer_id: string | null;
  payment_mode: 'Cash' | 'Card' | 'UPI';
  subtotal: number;
  discount: number;
  gst: number;
  final_total: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  created_at: string;
  profiles?: Profile | null;
  order_line_items?: OrderLineItem[];
}
