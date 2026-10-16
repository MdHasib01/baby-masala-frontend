import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Gift, CheckCircle2, ArrowRight } from 'lucide-react';
import { User } from '../../types';
import { babyCareService } from '../../services/babyCareService';
import { errorMessage } from '../../services/api';

interface MembershipActivationScreenProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onFinish: () => void;
}

export const MembershipActivationScreen: React.FC<MembershipActivationScreenProps> = ({
  user,
  onUpdateUser,
  onFinish,
}) => {
  const [coupon, setCoupon] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successState, setSuccessState] = useState(user.isMember);
  const [showDemoPurchaseModal, setShowDemoPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handleActivateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon.trim()) {
      setErrorMsg('দয়া করে কুপন কোড লিখুন।');
      return;
    }

    try {
      // The coupon is validated by the server.
      const res = await babyCareService.activateMembership(coupon.trim());
      onUpdateUser(res.user);
      setSuccessState(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(errorMessage(err));
    }
  };

  const handleDemoPurchase = async () => {
    try {
      const res = await babyCareService.demoPurchaseMembership();
      onUpdateUser(res.user);
      setPurchaseSuccess(true);
      setTimeout(() => {
        setShowDemoPurchaseModal(false);
        setSuccessState(true);
      }, 1200);
    } catch (err) {
      setShowDemoPurchaseModal(false);
      setErrorMsg(errorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between p-6 max-w-md mx-auto font-hind selection:bg-[#EDD6A9] selection:text-[#56020A]">
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-1.5 bg-white rounded-full border-2 border-[#56020A] shadow-md">
            <img src="/logo.png" alt="Baby Care" className="w-14 h-14 rounded-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-[#56020A]">প্রিমিয়াম মেম্বারশিপ অ্যাক্টিভেশন</h1>
          <p className="text-xs text-gray-600">
            বেবি কেয়ারের সকল প্রিমিয়াম ফিচার ও এক্সক্লুসিভ গাইডলাইন আনলক করুন।
          </p>
        </div>

        {successState ? (
          <div className="bg-white p-6 rounded-2xl border border-[#EDD6A9] shadow-sm text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#56020A]">মেম্বারশিপ সফলভাবে সক্রিয় হয়েছে!</h3>
            <p className="text-xs text-gray-600">
              আপনার অ্যাকাউন্টটি এখন প্রিমিয়াম অ্যাক্সেস সহ প্রস্তুত।
            </p>
            <button
              onClick={onFinish}
              className="w-full py-3.5 bg-[#56020A] text-white font-bold text-xs rounded-xl shadow hover:bg-[#56020A]/90 transition-colors flex items-center justify-center gap-2"
            >
              <span>শুরু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">নিয়মিত মূল্য:</span>
                <span className="text-base font-bold line-through text-gray-400">৳ ৮,০০০</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-[#56020A]">কুপন দিয়ে ফ্রি অ্যাক্টিভেশন:</span>
                <span className="text-sm font-bold text-[#375013] bg-[#375013]/10 px-2.5 py-1 rounded">
                  ৳ ০ (BABYCARE)
                </span>
              </div>
            </div>

            <form onSubmit={handleActivateCoupon} className="space-y-3 bg-white p-5 rounded-2xl border border-[#EDD6A9] shadow-sm">
              <label className="block text-xs font-bold text-[#56020A]">কুপন কোড লিখুন</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="BABYCARE"
                    className="w-full px-3 py-2.5 text-xs bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#56020A] uppercase font-mono font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#56020A] text-white text-xs font-bold rounded-xl hover:bg-[#56020A]/90 transition-colors whitespace-nowrap"
                >
                  অ্যাক্টিভ করুন
                </button>
              </div>
              {errorMsg && <p className="text-xs text-red-600 pt-1">{errorMsg}</p>}
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 mb-2">কুপন না থাকলে সরাসরি মেম্বারশিপ নিতে পারেন:</p>
              <button
                onClick={() => setShowDemoPurchaseModal(true)}
                className="w-full py-3 bg-[#375013] text-white font-bold text-xs rounded-xl shadow hover:bg-[#375013]/90 transition-colors"
              >
                মেম্বারশিপ কিনুন (৳ ৮,০০০ - ডেমো)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Demo Purchase Dialog */}
      {showDemoPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4 text-center">
            <h3 className="text-base font-bold text-[#56020A]">ডেমো মেম্বারশিপ চেকআউট</h3>
            <p className="text-xs text-gray-700">
              মূল্য: <span className="font-bold text-[#56020A]">৳ ৮,০০০</span> (এটি একটি সম্পূর্ণ সিমুলেটেড ডেমো পেমেন্ট, কোনো আসল টাকা কাটা হবে না)।
            </p>

            {purchaseSuccess && (
              <p className="text-xs text-green-700 bg-green-50 p-2 rounded">সফল পেমেন্ট! মেম্বারশিপ সক্রিয় হচ্ছে...</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDemoPurchaseModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={handleDemoPurchase}
                className="flex-1 py-2 bg-[#56020A] text-white text-xs font-bold rounded-xl"
              >
                পেমেন্ট কনফার্ম করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
