import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';

interface LoginScreenProps {
  onBack: () => void;
  onProceed: (email: string, password: string) => Promise<void> | void;
  onGoToSignUp: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onProceed, onGoToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('ইমেইল ঠিকানা লিখুন।');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('সঠিক ইমেইল ঠিকানা দিন।');
      return;
    }
    if (!password) {
      setErrorMsg('পাসওয়ার্ড লিখুন।');
      return;
    }

    setErrorMsg('');
    setIsSending(true);
    try {
      await onProceed(email.trim(), password);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'লগইন করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between p-6 max-w-md mx-auto font-hind selection:bg-[#EDD6A9] selection:text-[#56020A]">
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-[#EDD6A9]/30 text-[#56020A] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5 bg-[#EDD6A9]/30 px-2.5 py-1 rounded-full border border-[#EDD6A9]/60">
            <img src="/logo.png" alt="Baby Care" className="w-5 h-5 rounded-full object-cover" />
            <span className="text-[11px] font-bold text-[#56020A]">Baby Care</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#56020A]">লগইন করুন</h1>
          <p className="text-xs text-gray-600">আপনার অ্যাকাউন্টের ইমেইল ও পাসওয়ার্ড দিন।</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#56020A] mb-1">ইমেইল ঠিকানা</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mother@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#56020A] mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                className="absolute right-3 top-2.5 p-0.5 text-gray-400 hover:text-[#56020A]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3.5 bg-[#56020A] hover:bg-[#56020A]/90 text-white font-bold text-sm rounded-xl shadow-md transition-colors mt-4 disabled:opacity-60"
          >
            {isSending ? 'লগইন হচ্ছে...' : 'লগইন'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-600">
            অ্যাকাউন্ট নেই?{' '}
            <button
              onClick={onGoToSignUp}
              className="text-[#56020A] font-bold underline hover:text-[#375013]"
            >
              এখানে অ্যাকাউন্ট খুলুন
            </button>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-500 pb-4">
        <img src="/logo.png" alt="Baby Care" className="w-4 h-4 rounded-full object-cover" />
        <span>Baby Care by Baby Masala</span>
      </div>
    </div>
  );
};
