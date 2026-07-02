'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import OrderReceipt from '@/components/OrderReceipt';
import Link from 'next/link';
import { CheckCircle, History, ShoppingBag, Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const name = searchParams.get('name') || 'Customer';
  const phone = searchParams.get('phone') || 'N/A';

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_line_items(*)')
          .eq('id', orderId)
          .single();

        if (!error && data) {
          setOrder(data as Order);
        }
      } catch (err) {
        console.error('Failed to load success order:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
      {/* Success Banner */}
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-bounce" />
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1F3A2E]">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-md mx-auto">
          Thank you, {name}! Your artisanal pizza is being prepared and will arrive at your counter/doorstep in 30 minutes.
        </p>
      </div>

      {/* Bill Card Section */}
      <div className="mb-10">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-[#234E3C] animate-spin" />
          </div>
        ) : order ? (
          <OrderReceipt order={order} customerName={name} customerPhone={phone} />
        ) : (
          /* Mock order for offline demo fallback */
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-md mx-auto text-black">
            <h3 className="font-bold text-amber-800 mb-2">Offline Mock Mode</h3>
            <p className="text-xs text-amber-700 leading-relaxed mb-4">
              Since we are running in offline mode without Supabase connection, we couldn't fetch order ID "{orderId || 'offline'}" from the database.
            </p>
            <div className="border border-dashed border-amber-300 rounded-xl p-4 bg-white text-left font-mono text-xs">
              <div>Customer: {name}</div>
              <div>Phone: {phone}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
              <div className="mt-2 pt-2 border-t border-gray-100 font-bold text-emerald-800">
                Order Logged locally (Simulated)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href="/menu"
          className="w-full sm:w-auto bg-[#234E3C] hover:bg-[#1F3A2E] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all text-sm"
        >
          <ShoppingBag className="w-4 h-4" /> Start New Order
        </Link>
        <Link
          href="/orders"
          className="w-full sm:w-auto border-2 border-[#234E3C] text-[#234E3C] hover:bg-emerald-50 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all text-sm"
        >
          <History className="w-4 h-4" /> View Order History
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-12 flex-grow">
        <Loader2 className="w-8 h-8 text-[#234E3C] animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
