import React from 'react';
import { Sparkles, Heart, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onGoToSignUp: () => void;
  onGoToLogin: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGoToSignUp, onGoToLogin }) => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-between p-6 max-w-md mx-auto font-hind selection:bg-[#EDD6A9] selection:text-[#56020A]">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 pt-10">
        <div className="w-28 h-28 rounded-full bg-white border-4 border-[#56020A] flex items-center justify-center shadow-xl text-[#56020A] relative p-1">
          <img
            src="/logo.png"
            alt="Baby Care Logo"
            className="w-full h-full object-cover rounded-full"
          />
          <span className="absolute -bottom-2 bg-[#375013] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            ১০০% নিরাপদ
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#56020A] tracking-tight">Baby Care</h1>
          <p className="text-sm font-semibold text-[#375013] uppercase tracking-wider">
            by Baby Masala
          </p>
          <p className="text-xs text-gray-600 max-w-xs mx-auto pt-2 leading-relaxed">
            বাংলাদেশের মায়েদের জন্য আস্থার সাথে তৈরি শিশুর পুষ্টি, সঠিক পরিচর্যা ও মমতাময়ী কমিউনিটি প্ল্যাটফর্ম।
          </p>
        </div>

        <div className="w-full bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3 text-left">
          <div className="flex items-center gap-3 text-xs text-gray-700">
            <ShieldCheck className="w-5 h-5 text-[#375013] shrink-0" />
            <span>বিশেষজ্ঞ নির্দেশিকা ও বয়সভিত্তিক চার্ট</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-700">
            <Sparkles className="w-5 h-5 text-[#D6AA4F] shrink-0" />
            <span>প্রিমিয়াম হার্বস ও রিওয়ার্ডস ক্লাব</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pb-8">
        <button
          onClick={onGoToSignUp}
          className="w-full py-3.5 bg-[#56020A] hover:bg-[#56020A]/90 text-white font-bold text-sm rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>অ্যাকাউন্ট খুলুন</span>
        </button>
        <button
          onClick={onGoToLogin}
          className="w-full py-3.5 bg-white border-2 border-[#56020A] text-[#56020A] hover:bg-[#FAF6F0] font-bold text-sm rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>লগইন করুন</span>
        </button>
      </div>
    </div>
  );
};
