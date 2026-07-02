'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCustomerOrders } from '@/lib/services';
import { Order } from '@/lib/types';
import OrderReceipt from '@/components/OrderReceipt';
import Link from 'next/link';
import { History, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/lib/context/ToastContext';

export default function OrdersHistoryPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchOrders(user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchOrders(currentUser.id);
      } else {
        setOrders([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchOrders(userId: string) {
    const { isSupabaseConfigured } = require('@/lib/supabase');
    try {
      setLoading(true);
      if (isSupabaseConfigured) {
        const data = await getCustomerOrders(userId);
        setOrders(data);
      } else {
        // Simulated offline orders list
        setOrders([
          {
            id: 'simulated-order-101',
            customer_id: userId,
            payment_mode: 'UPI',
            subtotal: 957,
            discount: 95.7,
            gst: 155.03,
            final_total: 1016.33,
            status: 'pending',
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            order_line_items: [
              { id: '1', order_id: 'simulated-order-101', menu_item_id: 'pizza_1', category: 'pizza', item_name: 'Margherita', unit_price: 299, quantity: 2, line_number: 1 },
              { id: '2', order_id: 'simulated-order-101', menu_item_id: 'base_1', category: 'base', item_name: 'Thin Crust', unit_price: 149, quantity: 2, line_number: 1 },
              { id: '3', order_id: 'simulated-order-101', menu_item_id: 'pizza_5', category: 'pizza', item_name: 'Pepperoni Classic', unit_price: 379, quantity: 1, line_number: 2 },
              { id: '4', order_id: 'simulated-order-101', menu_item_id: 'base_3', category: 'base', item_name: 'Cheese Burst', unit_price: 229, quantity: 1, line_number: 2 }
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load orders history:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'completed': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-[#234E3C] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 my-auto">
        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Sign In to view Order History</h2>
        <p className="text-sm text-gray-500 mt-2">
          You must be logged in to view your past orders.
        </p>
        <Link href="/checkout" className="inline-block mt-6 bg-[#234E3C] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm">
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      <h1 className="font-serif text-3xl font-extrabold text-[#1F3A2E] mb-8">
        Your Order History
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E5E0D8] rounded-2xl p-8 max-w-md mx-auto my-auto shadow-sm">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">No orders placed yet</h2>
          <p className="text-sm text-gray-500 mt-2">
            Your previous orders will appear here once you place them!
          </p>
          <Link href="/menu" className="inline-block mt-6 bg-[#234E3C] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm">
            Order a Pizza
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const itemCounts = order.order_line_items?.filter(i => i.category === 'pizza').reduce((sum, item) => sum + item.quantity, 0) || 0;
            const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E5E0D8] rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Order Summary Header Row */}
                <div className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-6 gap-y-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date</div>
                      <div className="font-bold text-gray-900 mt-0.5">{dateStr}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</div>
                      <div className="font-mono text-xs text-gray-600 mt-0.5" title={order.id}>
                        #{order.id.slice(0, 8)}...
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pizzas</div>
                      <div className="font-bold text-gray-900 mt-0.5">{itemCounts} {itemCounts === 1 ? 'pizza' : 'pizzas'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</div>
                      <div className="font-bold text-[#14532D] mt-0.5">₹{Number(order.final_total).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>

                    <button
                      onClick={() => toggleExpandOrder(order.id)}
                      className="border border-[#234E3C] text-[#234E3C] hover:bg-emerald-50 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95"
                    >
                      {isExpanded ? (
                        <>
                          Hide Receipt <EyeOff className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          View Receipt <Eye className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Receipt Details */}
                {isExpanded && (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-5 sm:p-6">
                    <OrderReceipt order={order} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
