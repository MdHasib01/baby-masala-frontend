import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

interface LoginScreenProps {
  onBack: () => void;
  onProceed: (contact: string, method: 'email' | 'whatsapp') => Promise<void> | void;
  onGoToSignUp: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onProceed, onGoToSignUp }) => {
  const [method, setMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [contact, setContact] = useState('01712345678'); // Default demo account
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setErrorMsg(method === 'whatsapp' ? 'হোয়াটসঅ্যাপ নম্বর লিখুন।' : 'ইমেইল ঠিকানা লিখুন।');
      return;
    }

    if (method === 'whatsapp' && !/^01[0-9]{9}$/.test(contact.trim())) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return;
    }

    if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())) {
      setErrorMsg('সঠিক ইমেইল ঠিকানা দিন।');
      return;
    }

    setErrorMsg('');
    setIsSending(true);
    try {
      await onProceed(contact.trim(), method);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'কোড পাঠানো যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between p-6 max-w-md mx-auto font-hind selection:bg-[#EDD6A9] selection:text-[#56020A]">
      <div className="space-y-6 pt-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-[#EDD6A9]/30 text-[#56020A] transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#56020A]">লগইন করুন</h1>
          <p className="text-xs text-gray-600">আপনার অ্যাকাউন্টে প্রবেশ করতে যোগাযোগ মাধ্যম দিন।</p>
          <p className="text-[11px] text-[#375013] font-semibold pt-1">
            (ডেমো অ্যাকাউন্ট: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#EDD6A9]">01712345678</span>)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#56020A] mb-1">লগইন মাধ্যম</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMethod('whatsapp')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  method === 'whatsapp'
                    ? 'bg-[#56020A] text-white border-[#56020A]'
                    : 'bg-white text-gray-700 border-[#EDD6A9]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" /> হোয়াটসঅ্যাপ
              </button>
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  method === 'email'
                    ? 'bg-[#56020A] text-white border-[#56020A]'
                    : 'bg-white text-gray-700 border-[#EDD6A9]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> ইমেইল
              </button>
            </div>

            {method === 'whatsapp' ? (
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="01712345678"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]"
                />
              </div>
            ) : (
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="mother@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]"
                />
              </div>
            )}
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
            {isSending ? 'কোড পাঠানো হচ্ছে...' : 'কোড পাঠান'}
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

      <div className="text-center text-[11px] text-gray-500 pb-4">
        Baby Care by Baby Masala
      </div>
    </div>
  );
};
