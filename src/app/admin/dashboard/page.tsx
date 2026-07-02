'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminOrders, updateOrderStatus, calculateMetrics, DashboardMetrics } from '@/lib/services';
import { Order } from '@/lib/types';
import OrderReceipt from '@/components/OrderReceipt';
import { useToast } from '@/lib/context/ToastContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Pizza, 
  Clock, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  LogOut,
  RefreshCw
} from 'lucide-react';

const MOCK_ORDERS: Order[] = [
  {
    id: 'simulated-order-1',
    customer_id: 'mock-u1',
    payment_mode: 'UPI',
    subtotal: 957,
    discount: 95.7,
    gst: 155.03,
    final_total: 1016.33,
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    profiles: { id: 'mock-u1', name: 'Rahul Sharma', phone: '9876543210', role: 'customer', created_at: '' },
    order_line_items: [
      { id: '1', order_id: 'simulated-order-1', menu_item_id: 'pizza_1', category: 'pizza', item_name: 'Margherita', unit_price: 299, quantity: 2, line_number: 1 },
      { id: '2', order_id: 'simulated-order-1', menu_item_id: 'base_1', category: 'base', item_name: 'Thin Crust', unit_price: 149, quantity: 2, line_number: 1 },
      { id: '3', order_id: 'simulated-order-1', menu_item_id: 'pizza_5', category: 'pizza', item_name: 'Pepperoni Classic', unit_price: 379, quantity: 1, line_number: 2 },
      { id: '4', order_id: 'simulated-order-1', menu_item_id: 'base_3', category: 'base', item_name: 'Cheese Burst', unit_price: 229, quantity: 1, line_number: 2 }
    ]
  },
  {
    id: 'simulated-order-2',
    customer_id: 'mock-u2',
    payment_mode: 'Card',
    subtotal: 518,
    discount: 0,
    gst: 93.24,
    final_total: 611.24,
    status: 'preparing',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    profiles: { id: 'mock-u2', name: 'Pooja Singh', phone: '8765432109', role: 'customer', created_at: '' },
    order_line_items: [
      { id: '5', order_id: 'simulated-order-2', menu_item_id: 'pizza_4', category: 'pizza', item_name: 'Farm House', unit_price: 319, quantity: 1, line_number: 1 },
      { id: '6', order_id: 'simulated-order-2', menu_item_id: 'base_5', category: 'base', item_name: 'Multigrain', unit_price: 199, quantity: 1, line_number: 1 }
    ]
  },
  {
    id: 'simulated-order-3',
    customer_id: 'mock-u3',
    payment_mode: 'Cash',
    subtotal: 2190,
    discount: 219,
    gst: 354.78,
    final_total: 2325.78,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    profiles: { id: 'mock-u3', name: 'Amit Verma', phone: '7654321098', role: 'customer', created_at: '' },
    order_line_items: [
      { id: '7', order_id: 'simulated-order-3', menu_item_id: 'pizza_1', category: 'pizza', item_name: 'Margherita', unit_price: 299, quantity: 5, line_number: 1 },
      { id: '8', order_id: 'simulated-order-3', menu_item_id: 'base_1', category: 'base', item_name: 'Thin Crust', unit_price: 139, quantity: 5, line_number: 1 }
    ]
  }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: 0, totalOrders: 0, avgOrderValue: 0, topSellingPizza: 'N/A', peakHour: 0
  });

  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check authorization
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/admin/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role !== 'admin') {
        router.push('/');
        showToast('Unauthorized access', 'error');
      } else {
        loadDashboardData();
      }
    }).catch(() => {
      // Offline fallback
      setIsOffline(true);
      loadMockData();
    });
  }, [router]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      if (data && data.length > 0) {
        setOrders(data);
        setMetrics(calculateMetrics(data));
      } else {
        setIsOffline(true);
        loadMockData();
      }
    } catch (err) {
      console.warn('Dashboard DB load failed. Operating in Simulated offline Mode:', err);
      setIsOffline(true);
      loadMockData();
    } finally {
      setLoading(false);
    }
  }

  function loadMockData() {
    setOrders(MOCK_ORDERS);
    setMetrics(calculateMetrics(MOCK_ORDERS));
    setLoading(false);
  }

  const handleStatusChange = async (orderId: string, nextStatus: any) => {
    setUpdatingId(orderId);
    try {
      if (isOffline) {
        // Simulated offline change
        const updated = orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o);
        setOrders(updated);
        setMetrics(calculateMetrics(updated));
        showToast(`Order status updated to ${nextStatus} (Offline Sim)`, 'success');
      } else {
        await updateOrderStatus(orderId, nextStatus);
        showToast(`Order status updated to ${nextStatus}`, 'success');
        // Refresh
        const freshOrders = await getAdminOrders();
        setOrders(freshOrders);
        setMetrics(calculateMetrics(freshOrders));
      }
    } catch (err) {
      showToast('Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
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

  const filteredOrders = orders.filter(order => {
    if (selectedStatusTab === 'all') return true;
    return order.status === selectedStatusTab;
  });

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-[#234E3C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col text-black">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-[#1F3A2E]">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Monitor restaurant sales, KPIs, and manage live pizza order queues.
          </p>
          {isOffline && (
            <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded mt-2">
              🚨 Simulated Offline Demo Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="p-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all text-gray-600"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
        {/* Sales Revenue */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-800 p-3 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Revenue</p>
            <p className="font-serif text-xl font-black text-gray-900 mt-0.5">
              ₹{metrics.revenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 text-blue-800 p-3 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Orders</p>
            <p className="font-serif text-xl font-black text-gray-900 mt-0.5">
              {metrics.totalOrders}
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 text-purple-800 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg Order Value</p>
            <p className="font-serif text-xl font-black text-gray-900 mt-0.5">
              ₹{metrics.avgOrderValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Top Selling Pizza */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 text-amber-800 p-3 rounded-xl">
            <Pizza className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Top Pizza</p>
            <p className="font-serif text-base font-black text-gray-900 mt-0.5 truncate" title={metrics.topSellingPizza}>
              {metrics.topSellingPizza}
            </p>
          </div>
        </div>

        {/* Peak Ordering Hour */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-rose-100 text-rose-800 p-3 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Peak Hour</p>
            <p className="font-serif text-xl font-black text-gray-900 mt-0.5">
              {metrics.peakHour === 0 ? 'N/A' : `${metrics.peakHour}:00`}
            </p>
          </div>
        </div>
      </div>

      {/* Orders List Title and Status Tabs */}
      <div className="border border-[#E5E0D8] rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
          <h2 className="font-bold text-gray-800 text-lg">Order Queue</h2>
          
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1">
            {['all', 'pending', 'preparing', 'completed', 'cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedStatusTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedStatusTab === tab
                    ? 'bg-[#1F3A2E] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Queue Table / List */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No orders found under status "{selectedStatusTab}".
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const formattedDate = new Date(order.created_at).toLocaleString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                day: '2-digit',
                month: 'short'
              });

              // Reconstruct main items
              const pizzasList = order.order_line_items
                ?.filter(item => item.category === 'pizza')
                .map(item => `${item.item_name} ×${item.quantity}`)
                .join(', ') || 'Custom pizza combo';

              return (
                <div key={order.id} className="p-6 hover:bg-gray-50/40 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Customer & Time info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{order.profiles?.name || 'Walk-in Customer'}</span>
                        <span className="text-xs text-gray-500">· {order.profiles?.phone || 'N/A'}</span>
                        <span className="text-xs text-gray-400 font-mono">({order.id.slice(0, 8)})</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{formattedDate}</div>
                      
                      {/* Pizzas description */}
                      <div className="text-sm font-semibold text-[#1F3A2E] mt-2.5">
                        🍕 {pizzasList}
                      </div>
                    </div>

                    {/* Pricing & Control elements */}
                    <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-between lg:justify-end">
                      <div className="text-right min-w-[90px]">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Payable</span>
                        <span className="font-serif font-extrabold text-[#14532D]">₹{Number(order.final_total).toFixed(2)}</span>
                      </div>

                      {/* Dropdown status update */}
                      <div className="relative">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`appearance-none pr-8 pl-3.5 py-2 border rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]/15 cursor-pointer disabled:opacity-50 ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all text-gray-500"
                        title={isExpanded ? "Hide Details" : "Show Details"}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible expanded detail */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-gray-100 bg-gray-50/50 rounded-xl p-4">
                      <OrderReceipt order={order} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
