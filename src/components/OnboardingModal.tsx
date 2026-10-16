import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, CheckCircle2, Sparkles, Gift } from 'lucide-react';

interface OnboardingModalProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  user,
  onUpdateUser,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState(user.name);
  const [contact, setContact] = useState(user.contact);
  const [coupon, setCoupon] = useState(user.couponUsed || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('দয়া করে আপনার নাম লিখুন।');
      return;
    }
    if (!contact.trim()) {
      setErrorMsg('সঠিক ইমেইল বা হোয়াটসঅ্যাপ নম্বর দিন।');
      return;
    }

    if (coupon.trim().toUpperCase() === 'BABYCARE') {
      onUpdateUser({
        ...user,
        name,
        contact,
        isMember: true,
        isVerified: true,
        membershipExpiry: 'জীবনব্যাপী ফ্রি (ডেমো কুপন)',
        couponUsed: 'BABYCARE',
      });
      setSuccessMsg('অভিনন্দন! BABYCARE কুপন কোডের মাধ্যমে আপনার ৳৮,০০০ মূল্যের প্রিমিয়াম মেম্বারশিপ সক্রিয় হয়েছে!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } else if (!coupon.trim()) {
      // Allow joining without coupon as standard or require demo coupon
      setErrorMsg('দয়া করে ডেমো কুপন কোড BABYCARE ব্যবহার করুন।');
    } else {
      setErrorMsg('ভুল কুপন কোড! ডেমো কুপন হিসেবে BABYCARE ব্যবহার করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EDD6A9] relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#56020A] via-[#375013] to-[#D6AA4F]" />

        <div className="text-center mb-6 pt-2">
          <div className="inline-flex p-3 bg-[#EDD6A9]/30 rounded-full text-[#56020A] mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#56020A]">বেবি কেয়ার বাই বেবি মসলা</h2>
          <p className="text-xs text-[#375013] font-medium mt-1">
            মায়ের যত্ন ও শিশুর পুষ্টির বিশ্বস্ত সঙ্গী
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#EDD6A9]/50 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 font-medium">প্রিমিয়াম মেম্বারশিপ মূল্য:</span>
            <span className="text-sm font-bold line-through text-gray-400">৳ ৮,০০০</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-[#56020A]">কুপন কোড দিয়ে ফ্রি অ্যাক্টিভেশন:</span>
            <span className="text-sm font-bold text-[#375013] bg-[#375013]/10 px-2 py-0.5 rounded">
              ৳ ০ (BABYCARE)
            </span>
          </div>
        </div>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#56020A] mb-1">মায়ের নাম</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#EDD6A9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56020A]"
              placeholder="আপনার নাম লিখুন"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#56020A] mb-1">হোয়াটসঅ্যাপ বা ইমেইল</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#EDD6A9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56020A]"
              placeholder="01712345678 বা email@gmail.com"
            />
            <span className="text-[11px] text-gray-500 mt-0.5 block">ডেমো যাচাইকরণ প্রক্রিয়া (কোনো রিয়েল মেসেজ পাঠানো হবে না)</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#56020A] mb-1">কুপন কোড</label>
            <div className="relative">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#EDD6A9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56020A] uppercase font-mono"
                placeholder="BABYCARE"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#375013] font-bold">
                <Gift className="w-4 h-4 inline mr-1" /> ফ্রি
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#56020A] hover:bg-[#56020A]/90 text-white font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>মেম্বারশিপ সক্রিয় করুন</span>
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-[#56020A] underline"
          >
            পরে করুন / এড়িয়ে যান
          </button>
        </div>
      </div>
    </div>
  );
};
