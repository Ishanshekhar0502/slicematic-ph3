import { supabase } from './supabase';
import { MenuItem, CartItem, Order, Profile } from './types';
import { computeBillForCart } from './pricing';

// Fetch all menu items from Supabase
export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('category', { ascending: true })
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching menus:', error);
    throw error;
  }
  return data as MenuItem[];
}

// Place order (creates order and line items)
export async function placeOrder(
  customerId: string,
  cart: CartItem[],
  paymentMode: 'Cash' | 'Card' | 'UPI'
): Promise<Order> {
  const bill = computeBillForCart(cart);

  // 1. Create the order header
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      payment_mode: paymentMode,
      subtotal: bill.subtotal,
      discount: bill.discount,
      gst: bill.gst,
      final_total: bill.finalTotal,
      status: 'pending'
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  const orderId = orderData.id;

  // 2. Prepare line items
  // For each cart combo (base + pizza + topping), we insert up to 3 records with the same line_number
  const itemsToInsert: any[] = [];
  
  cart.forEach((item, index) => {
    const lineNumber = index + 1;

    // Add Base crust
    itemsToInsert.push({
      order_id: orderId,
      menu_item_id: item.base.id,
      category: 'base',
      item_name: item.base.name,
      unit_price: item.base.price,
      quantity: item.qty,
      line_number: lineNumber
    });

    // Add Pizza flavor
    itemsToInsert.push({
      order_id: orderId,
      menu_item_id: item.pizza.id,
      category: 'pizza',
      item_name: item.pizza.name,
      unit_price: item.pizza.price,
      quantity: item.qty,
      line_number: lineNumber
    });

    // Add Topping (if exists)
    if (item.topping && item.topping.id !== '0' && item.topping.name !== 'No Topping') {
      itemsToInsert.push({
        order_id: orderId,
        menu_item_id: item.topping.id,
        category: 'topping',
        item_name: item.topping.name,
        unit_price: item.topping.price,
        quantity: item.qty,
        line_number: lineNumber
      });
    }
  });

  // 3. Insert line items
  const { error: linesError } = await supabase
    .from('order_line_items')
    .insert(itemsToInsert);

  if (linesError) {
    console.error('Error inserting line items:', linesError);
    // Note: In production we might delete the order header on failure, but for simplicity:
    throw linesError;
  }

  return orderData as Order;
}

// Fetch orders history for a customer
export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_line_items (*)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
  return data as Order[];
}

// Fetch all orders for Admin View
export async function getAdminOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (*),
      order_line_items (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin orders:', error);
    throw error;
  }
  return data as Order[];
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'preparing' | 'completed' | 'cancelled'
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Calculate KPI Metrics for Dashboard
export interface DashboardMetrics {
  revenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topSellingPizza: string;
  peakHour: number;
}

export function calculateMetrics(orders: Order[]): DashboardMetrics {
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const totalOrders = activeOrders.length;
  
  if (totalOrders === 0) {
    return { revenue: 0, totalOrders: 0, avgOrderValue: 0, topSellingPizza: 'N/A', peakHour: 0 };
  }

  const revenue = activeOrders.reduce((sum, o) => sum + Number(o.final_total), 0);
  const avgOrderValue = revenue / totalOrders;

  // Top Selling Pizza calculation
  const pizzaCounts: { [name: string]: number } = {};
  orders.forEach(o => {
    o.order_line_items?.forEach(item => {
      if (item.category === 'pizza') {
        pizzaCounts[item.item_name] = (pizzaCounts[item.item_name] || 0) + item.quantity;
      }
    });
  });

  let topSellingPizza = 'N/A';
  let maxPizzaCount = 0;
  for (const [name, count] of Object.entries(pizzaCounts)) {
    if (count > maxPizzaCount) {
      maxPizzaCount = count;
      topSellingPizza = name;
    }
  }

  // Peak Ordering Hour calculation
  const hourCounts: { [hour: number]: number } = {};
  activeOrders.forEach(o => {
    const date = new Date(o.created_at);
    const hour = date.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  let peakHour = 0;
  let maxHourCount = 0;
  for (const [hourStr, count] of Object.entries(hourCounts)) {
    const hour = Number(hourStr);
    if (count > maxHourCount) {
      maxHourCount = count;
      peakHour = hour;
    }
  }

  return {
    revenue: Math.round(revenue * 100) / 100,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    topSellingPizza,
    peakHour
  };
}
