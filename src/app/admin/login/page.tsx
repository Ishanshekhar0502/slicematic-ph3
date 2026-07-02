'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/context/ToastContext';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { isSupabaseConfigured } = require('@/lib/supabase');
    const { getMockUser } = require('@/lib/authMock');

    if (isSupabaseConfigured) {
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role === 'admin') {
            router.push('/admin/dashboard');
          }
        }
      });
    } else {
      const mu = getMockUser();
      if (mu && mu.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { isSupabaseConfigured } = require('@/lib/supabase');
    const { setMockUser } = require('@/lib/authMock');

    try {
      if (isSupabaseConfigured) {
        const { data, error: loginErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginErr) throw loginErr;

        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileErr || profile?.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Access denied. You do not have administrator privileges.');
        }

        showToast('Welcome, Administrator!', 'success');
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        // Offline Mock Login Validation
        if (!email.toLowerCase().endsWith('@slicematic.com')) {
          throw new Error('Access denied. Administrator emails must end with @slicematic.com.');
        }
        
        setMockUser({
          id: 'simulated-admin-id',
          email: email.trim(),
          name: 'Demo Administrator',
          phone: '9999999999',
          role: 'admin'
        });

        showToast('Demo Mode: Welcome, Administrator!', 'success');
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-16 sm:py-24 my-auto">
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-[#1F3A2E] text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#C8A96A]">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1F3A2E]">Admin Portal</h1>
          <p className="text-xs text-gray-500 mt-1">Authorized access only</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg text-sm font-medium mb-5">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@slicematic.com"
                className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-[#C8A96A] focus:outline-none text-black"
              />
            </div>
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-[#C8A96A] focus:outline-none text-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F3A2E] hover:bg-[#15271F] text-[#C8A96A] py-3 rounded-xl font-bold transition-all shadow-md mt-6 flex items-center justify-center gap-1.5 active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Informational alert for easier testing */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mt-6 text-xs text-emerald-800 leading-relaxed font-semibold">
          💡 <strong>Testing Instructions:</strong><br />
          Any email ending in <strong className="text-emerald-900 font-extrabold">@slicematic.com</strong> is auto-assigned the admin role upon signup. Feel free to use the checkout page to sign up an admin account (e.g., <code className="bg-white/80 px-1 py-0.5 rounded border">admin@slicematic.com</code>) for testing.
        </div>

      </div>
    </div>
  );
}
