import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, Shield } from 'lucide-react';
import { User } from '../types';
import { babyCareService } from '../services/babyCareService';
import { errorMessage, tokenStore } from '../services/api';

export const NOT_ADMIN_MESSAGE = 'এই অ্যাকাউন্টের অ্যাডমিন অ্যাক্সেস নেই।';

/** Email + password sign-in (POST /api/auth/login). Only accounts with the admin role get in. */
export const AdminLogin: React.FC<{ onLogin: (user: User) => void; notice?: string }> = ({ onLogin, notice }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(notice || '');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const { user } = await babyCareService.login(email.trim(), password);
      if (!user.isAdmin) {
        tokenStore.clear();
        setError(NOT_ADMIN_MESSAGE);
        return;
      }
      onLogin(user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputWrap =
    'flex items-center gap-2.5 px-3.5 py-3 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus-within:ring-2 focus-within:ring-[#56020A]/20 focus-within:border-[#56020A]/40';

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FAF6F0]">
      {/* Brand panel (large screens) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#56020A] text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#EDD6A9]/10" />
        <div className="absolute -left-16 bottom-10 w-72 h-72 rounded-full bg-[#EDD6A9]/5" />
        <div className="flex items-center gap-3 relative">
          <img src="/logo-192.png" alt="" className="w-11 h-11 rounded-full border-2 border-[#EDD6A9]/60" />
          <div>
            <p className="font-bold text-lg leading-none">Baby Care</p>
            <p className="text-[11px] text-[#EDD6A9] tracking-wider uppercase mt-1">by Baby Masala</p>
          </div>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-[#EDD6A9] mt-3 max-w-sm leading-relaxed">
            কমিউনিটি পোস্ট, অর্ডার, কনটেস্ট, অভিযোগ ও AI ইউজার — সব এক জায়গা থেকে পরিচালনা করুন।
          </p>
        </div>
        <p className="text-xs text-[#EDD6A9]/70 relative">© Baby Masala</p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#56020A] flex items-center justify-center mb-4 shadow-lg shadow-[#56020A]/20">
              <Shield className="w-7 h-7 text-[#EDD6A9]" />
            </div>
            <h2 className="text-2xl font-bold text-[#2D2327]">অ্যাডমিন লগইন</h2>
            <p className="text-sm text-gray-500 mt-1">আপনার অ্যাডমিন ইমেইল ও পাসওয়ার্ড দিন</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                ইমেইল
              </label>
              <div className={inputWrap}>
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-gray-700 mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className={inputWrap}>
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-gray-400 hover:text-[#56020A]"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#56020A] hover:bg-[#6d0812] text-white font-bold rounded-xl transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              লগইন করুন
            </button>
          </div>

          <a href="/" className="block text-center text-xs text-gray-500 hover:text-[#56020A] mt-8">
            ← অ্যাপে ফিরে যান
          </a>
        </form>
      </div>
    </div>
  );
};
