'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/context/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, History, Menu } from 'lucide-react';
import { Profile } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const { isSupabaseConfigured } = require('@/lib/supabase');
    const { getMockUser } = require('@/lib/authMock');

    const handleAuthCheck = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
          if (user) fetchProfile(user.id);
        } catch (e) {
          console.warn('Supabase session load failed, switching to offline fallback');
        }
      } else {
        const mu = getMockUser();
        if (mu) {
          setUser({ email: mu.email, id: mu.id });
          setProfile({ id: mu.id, role: mu.role, name: mu.name, phone: mu.phone, created_at: '' });
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    };

    handleAuthCheck();

    let subscription: any = null;
    if (isSupabaseConfigured) {
      const res = supabase.auth.onAuthStateChange(
        async (event, session) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            fetchProfile(currentUser.id);
          } else {
            setProfile(null);
          }
        }
      );
      subscription = res.data.subscription;
    }

    const onMockAuthChange = () => {
      handleAuthCheck();
    };
    window.addEventListener('mock-auth-change', onMockAuthChange);

    return () => {
      if (subscription) subscription.unsubscribe();
      window.removeEventListener('mock-auth-change', onMockAuthChange);
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (e) {
      console.error('Error loading user profile:', e);
    }
  }

  const handleSignOut = async () => {
    const { isSupabaseConfigured } = require('@/lib/supabase');
    const { setMockUser } = require('@/lib/authMock');

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      setMockUser(null);
    }
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-[#1F3A2E] border-b-4 border-[#C8A96A] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">🍕</span>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                SLICEMATIC
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/menu" className="hover:text-[#C8A96A] font-medium transition-colors">
              Menu
            </Link>

            {user && (
              <Link href="/orders" className="hover:text-[#C8A96A] font-medium flex items-center gap-1.5 transition-colors">
                <History className="w-4 h-4" /> My Orders
              </Link>
            )}

            {profile?.role === 'admin' && (
              <Link href="/admin/dashboard" className="text-[#C8A96A] hover:text-white font-semibold flex items-center gap-1.5 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}

            {/* Shopping Cart Link */}
            <Link href="/cart" className="relative p-2 text-white hover:text-[#C8A96A] transition-colors flex items-center gap-1">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8A96A] text-[#1F3A2E] font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Auth Block */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden lg:block">
                  <p className="text-xs text-emerald-300 font-semibold uppercase">{profile?.role}</p>
                  <p className="text-sm font-medium">{profile?.name || user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-transparent border border-white hover:bg-white hover:text-[#1F3A2E] px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="bg-[#C8A96A] hover:bg-[#bfa262] text-[#1F3A2E] px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-1"
              >
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <Link href="/cart" className="relative p-2 text-white hover:text-[#C8A96A]">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C8A96A] text-[#1F3A2E] font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-[#C8A96A] focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1F3A2E] border-t border-emerald-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md hover:bg-emerald-800 transition-colors"
          >
            Menu
          </Link>
          {user && (
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-emerald-800 transition-colors"
            >
              My Orders
            </Link>
          )}
          {profile?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md hover:bg-emerald-800 text-[#C8A96A] font-semibold transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <div className="pt-2 border-t border-emerald-800">
              <p className="px-3 text-xs text-emerald-300 font-semibold uppercase">{profile?.role}</p>
              <p className="px-3 pb-2 text-sm font-medium">{profile?.name || user.email}</p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-red-800 text-red-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md bg-[#C8A96A] text-[#1F3A2E] font-bold text-center"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
