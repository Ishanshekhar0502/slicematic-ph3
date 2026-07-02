'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { placeOrder } from '@/lib/services';
import { validateName, validatePhone } from '@/lib/validation';
import { CreditCard, Wallet, Landmark, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, bill, clearCart } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [formError, setFormError] = useState<string | null>(null);

  // Auth States
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const { isSupabaseConfigured } = require('@/lib/supabase');
    const { getMockUser } = require('@/lib/authMock');

    const checkAuth = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
          if (user) {
            fetchUserProfile(user.id);
          }
        } catch (e) {
          console.warn('Supabase checkout auth load failed');
        }
      } else {
        const mu = getMockUser();
        if (mu) {
          setUser({ email: mu.email, id: mu.id });
          setName(mu.name);
          setPhone(mu.phone);
        } else {
          setUser(null);
        }
      }
    };

    checkAuth();

    let subscription: any = null;
    if (isSupabaseConfigured) {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchUserProfile(currentUser.id);
        }
      });
      subscription = res.data.subscription;
    }

    const onMockAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('mock-auth-change', onMockAuthChange);

    return () => {
      if (subscription) subscription.unsubscribe();
      window.removeEventListener('mock-auth-change', onMockAuthChange);
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setName(data.name || '');
        setPhone(data.phone || '');
      }
    } catch (e) {
      console.error('Error fetching user profile details:', e);
    }
  }

  // Handle Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const { isSupabaseConfigured } = require('@/lib/supabase');
    const { setMockUser } = require('@/lib/authMock');

    try {
      if (isSignUp) {
        // Validate profile data before signup
        const nameErr = validateName(name);
        if (nameErr) throw new Error(nameErr);
        const phoneErr = validatePhone(phone);
        if (phoneErr) throw new Error(phoneErr);

        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, phone }
            }
          });

          if (error) throw error;
          
          setTimeout(() => {
            showToast("Account created successfully!", "success");
          }, 1000);
        } else {
          setMockUser({
            id: 'simulated-customer-id-' + Math.random().toString(36).substring(2, 9),
            email: email.trim(),
            name: name.trim(),
            phone: phone.trim(),
            role: email.toLowerCase().endsWith('@slicematic.com') ? 'admin' : 'customer'
          });
          showToast("Demo Mode: Account created successfully!", "success");
        }
      } else {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          showToast("Signed in successfully!", "success");
        } else {
          setMockUser({
            id: 'simulated-customer-id',
            email: email.trim(),
            name: name.trim() || 'Demo Customer',
            phone: phone.trim() || '9876543210',
            role: email.toLowerCase().endsWith('@slicematic.com') ? 'admin' : 'customer'
          });
          showToast("Demo Mode: Signed in successfully!", "success");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Place Order submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormError(null);
    setLoading(true);

    const { isSupabaseConfigured } = require('@/lib/supabase');

    try {
      // 1. Validate fields
      const nameErr = validateName(name);
      if (nameErr) {
        setFormError(nameErr);
        throw new Error(nameErr);
      }
      const phoneErr = validatePhone(phone);
      if (phoneErr) {
        setFormError(phoneErr);
        throw new Error(phoneErr);
      }

      if (cart.length === 0) {
        throw new Error("Cannot place an order with an empty cart.");
      }

      if (isSupabaseConfigured) {
        // 2. Write order to Database
        const order = await placeOrder(user.id, cart, paymentMode);
        clearCart();
        showToast("Order placed successfully!", "success");
        router.push(`/order-success?orderId=${order.id}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
      } else {
        // 3. Mock Order Redirect
        clearCart();
        showToast("Demo Mode: Order placed successfully!", "success");
        router.push(`/order-success?orderId=mock-order-${Math.random().toString(36).substring(2, 9)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
      }
    } catch (err: any) {
      console.error('Order placement failure:', err);
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 my-auto">
        <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mt-2">Add items to your cart before checking out.</p>
        <Link href="/menu" className="inline-block mt-4 bg-[#234E3C] text-white px-5 py-2 rounded-xl text-sm font-bold">
          Go to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-center">
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center gap-1 text-sm font-bold text-[#234E3C] hover:text-[#1F3A2E]">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="font-serif text-3xl font-extrabold text-[#1F3A2E] mt-3">Checkout</h1>
      </div>

      {!user ? (
        /* Sign In / Sign Up Form */
        <div className="max-w-md w-full mx-auto bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#1F3A2E] mb-6 text-center">
            {isSignUp ? 'Create Customer Account' : 'Sign In to Place Order'}
          </h2>

          {authError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg text-sm font-medium mb-5">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#C8A96A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#C8A96A] focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#C8A96A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#C8A96A] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#234E3C] hover:bg-[#1F3A2E] text-white py-3 rounded-xl font-bold transition-all shadow-md mt-6 flex items-center justify-center gap-1.5"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignUp ? (
                'Create Account & Continue'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-gray-500">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} className="text-[#234E3C] font-bold hover:underline">
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button onClick={() => setIsSignUp(true)} className="text-[#234E3C] font-bold hover:underline">
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Authenticated Checkout Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-2 bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#1F3A2E] mb-6 border-b border-gray-100 pb-3">
              Delivery & Payment Details
            </h2>

            {formError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg text-sm font-medium mb-6">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#C8A96A] focus:outline-none text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#C8A96A] focus:outline-none text-black"
                  />
                </div>
              </div>

              {/* Payment Select */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Cash', label: 'Cash on Delivery', desc: 'Pay counter staff', icon: <Wallet className="w-5 h-5" /> },
                    { id: 'Card', label: 'Credit/Debit Card', desc: 'Tap/Swipe at counter', icon: <CreditCard className="w-5 h-5" /> },
                    { id: 'UPI', label: 'UPI / QR Code', desc: 'Scan code at counter', icon: <Landmark className="w-5 h-5" /> }
                  ].map((mode) => {
                    const isSelected = paymentMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setPaymentMode(mode.id as any)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#1F3A2E] bg-emerald-50/50 ring-2 ring-[#1F3A2E]/10'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#1F3A2E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {mode.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{mode.label}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{mode.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#234E3C] hover:bg-[#1F3A2E] text-white py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 mt-6"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Place Order ₹' + bill.finalTotal.toFixed(2)}
              </button>
            </form>
          </div>

          {/* Bill Summary Right */}
          <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-6 shadow-sm text-black">
            <h2 className="text-lg font-bold text-[#14532D] mb-4">Summary Bill</h2>
            
            <div className="divide-y divide-emerald-100/60 text-sm space-y-3.5">
              {cart.map((item, idx) => {
                const sub = bill.lineSubtotals[idx];
                return (
                  <div key={idx} className="flex justify-between items-start pt-3 first:pt-0">
                    <div>
                      <div className="font-bold text-gray-900">{item.pizza.name} × {item.qty}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Base: {item.base.name}</div>
                    </div>
                    <span className="font-bold text-gray-900">₹{sub.toFixed(2)}</span>
                  </div>
                );
              })}

              <div className="pt-3.5 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{bill.subtotal.toFixed(2)}</span>
                </div>

                {bill.discount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-100 px-2 py-1 rounded-lg">
                    <span>Discount (10%)</span>
                    <span>-₹{bill.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>After discount</span>
                  <span className="font-bold text-gray-900">₹{bill.postDiscount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>GST @ 18%</span>
                  <span className="font-bold text-gray-900">₹{bill.gst.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-extrabold text-[#14532D] pt-3.5">
                <span>TOTAL PAYABLE</span>
                <span>₹{bill.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
