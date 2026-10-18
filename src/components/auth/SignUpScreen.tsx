import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, User as UserIcon } from 'lucide-react';
import { DEFAULT_CONTACT_METHOD, PHONE_LOGIN_ENABLED } from '../../lib/config';

interface SignUpScreenProps {
  onBack: () => void;
  onProceed: (name: string, contact: string, method: 'email' | 'whatsapp') => Promise<void> | void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onBack, onProceed }) => {
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'whatsapp' | 'email'>(DEFAULT_CONTACT_METHOD);
  const [agreed, setAgreed] = useState(false);
  const [contact, setContact] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('দয়া করে আপনার নাম লিখুন।');
      return;
    }
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

    if (!agreed) {
      setErrorMsg('অ্যাকাউন্ট খুলতে শর্তাবলী ও গোপনীয়তা নীতিতে সম্মতি দিন।');
      return;
    }

    setErrorMsg('');
    setIsSending(true);
    try {
      await onProceed(name.trim(), contact.trim(), method);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'কোড পাঠানো যায়নি। আবার চেষ্টা করুন।');
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
          <h1 className="text-2xl font-bold text-[#56020A]">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-xs text-gray-600">বেবি কেয়ার পরিবারে আপনাকে স্বাগতম।</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#56020A] mb-1">মায়ের নাম</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#56020A] mb-1">{PHONE_LOGIN_ENABLED ? 'যোগাযোগের মাধ্যম' : 'ইমেইল ঠিকানা'}</label>
            <div className={`grid grid-cols-2 gap-2 mb-3 ${PHONE_LOGIN_ENABLED ? '' : 'hidden'}`}>
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

          <label className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#56020A]"
            />
            <span>
              আমি{' '}
              <a href="/terms.html" target="_blank" rel="noopener" className="text-[#56020A] font-bold underline">ব্যবহারের শর্তাবলী</a>
              {' '}ও{' '}
              <a href="/privacy-policy.html" target="_blank" rel="noopener" className="text-[#56020A] font-bold underline">গোপনীয়তা নীতি</a>
              {' '}পড়েছি এবং সম্মত আছি। আমার বয়স ১৮ বছর বা তার বেশি।
            </span>
          </label>

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
            {isSending ? 'কোড পাঠানো হচ্ছে...' : 'যাচাইকরণ কোড পাঠান'}
          </button>
        </form>
      </div>

      <div className="text-center text-[11px] text-gray-500 pb-4">
        Baby Care by Baby Masala
      </div>
    </div>
  );
};
