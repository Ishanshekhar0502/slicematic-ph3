'use client';

import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { DISCOUNT_THRESHOLD } from '@/lib/pricing';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, bill } = useCart();
  const { showToast } = useToast();

  const handleQtyChange = (index: number, val: number) => {
    const currentQty = cart[index].qty;
    const nextQty = currentQty + val;
    if (nextQty >= 1 && nextQty <= 10) {
      const res = updateQuantity(index, nextQty);
      if (!res.success) {
        showToast(res.error || 'Failed to update quantity', 'error');
      }
    }
  };

  const handleRemove = (index: number) => {
    const itemName = cart[index].pizza.name;
    removeItem(index);
    showToast(`Removed ${itemName} from your cart.`, 'info');
  };

  const remainingForDiscount = DISCOUNT_THRESHOLD - bill.totalQty;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      <h1 className="font-serif text-3xl font-extrabold text-[#1F3A2E] mb-8">
        Your Cart ({bill.totalQty} {bill.totalQty === 1 ? 'item' : 'items'})
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E5E0D8] rounded-2xl p-8 max-w-md mx-auto my-auto shadow-sm">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mt-2">
            Add some custom artisanal pizzas to your cart to get started!
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 mt-6 bg-[#234E3C] hover:bg-[#1F3A2E] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const toppingName = item.topping ? item.topping.name : 'No Topping';
              const unitPrice = Number(item.pizza.price) + Number(item.base.price) + Number(item.topping?.price || 0);
              const lineSubtotal = bill.lineSubtotals[index];

              return (
                <div
                  key={index}
                  className="bg-white border border-[#E5E0D8] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Item #{index + 1}</div>
                    <h3 className="text-lg font-bold text-[#1F3A2E]">{item.pizza.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Crust: <strong className="text-gray-900">{item.base.name}</strong> · Topping: <strong className="text-gray-900">{toppingName}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Unit price: ₹{unitPrice.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => handleQtyChange(index, -1)}
                        disabled={item.qty <= 1}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-0.5 text-sm font-extrabold text-[#1F3A2E] min-w-[28px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleQtyChange(index, 1)}
                        disabled={item.qty >= 10}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <div className="text-xs text-gray-400 uppercase font-semibold">Subtotal</div>
                      <div className="font-serif font-bold text-[#1F3A2E]">
                        ₹{lineSubtotal?.toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#14532D] mb-4">Running Summary</h2>
            
            <div className="space-y-3.5 pb-5 border-b border-emerald-100/60">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Total Quantity</span>
                <span className="font-bold text-gray-900">{bill.totalQty}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Running Subtotal</span>
                <span className="font-bold text-gray-900">₹{bill.subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Discount unlocked indicator */}
            <div className="my-4 py-1">
              {bill.totalQty >= DISCOUNT_THRESHOLD ? (
                <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-3 rounded-r-xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  🎉 10% discount unlocked at checkout!
                </div>
              ) : (
                <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-3 rounded-r-xl text-xs leading-relaxed">
                  Add <strong className="text-amber-900 font-extrabold">{remainingForDiscount}</strong> more {remainingForDiscount === 1 ? 'pizza' : 'pizzas'} to unlock a <strong className="text-amber-900 font-extrabold">10% discount</strong>!
                </div>
              )}
            </div>

            <div className="text-[10px] text-gray-500 mb-6 font-medium leading-relaxed">
              Discount & GST details will be applied on the checkout page before payment.
            </div>

            <Link
              href="/checkout"
              className="w-full bg-[#234E3C] hover:bg-[#1F3A2E] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-800/10 hover:shadow-emerald-900/20 active:scale-95 transition-all text-sm"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
