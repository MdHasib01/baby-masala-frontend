import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface LoginVerifyScreenProps {
  contact: string;
  isLoginMode: boolean;
  onBack: () => void;
  /** Checks the code with the server; throws with a readable message on failure. */
  onVerify: (code: string) => Promise<void>;
  onVerifySuccess: () => void;
  onResend: () => Promise<void>;
  onChangeContact: () => void;
}

export const LoginVerifyScreen: React.FC<LoginVerifyScreenProps> = ({
  contact,
  isLoginMode,
  onBack,
  onVerify,
  onVerifySuccess,
  onResend,
  onChangeContact,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(59);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto advance focus
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-input-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setCode(digits);
    }
  };

  const handleResend = async () => {
    setErrorMsg('');
    try {
      await onResend();
      setCountdown(59);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'কোড পাঠানো যায়নি।');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setErrorMsg('দয়া করে ৬ ডিজিটের কোডটি সম্পূর্ণ করুন।');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await onVerify(fullCode);
      setSuccessMsg('যাচাইকরণ সফল হয়েছে!');
      setTimeout(() => {
        onVerifySuccess();
      }, 1000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'যাচাই করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
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

        <div className="space-y-1 text-center">
          <div className="inline-flex p-3 bg-[#EDD6A9]/30 rounded-full text-[#56020A] mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#56020A]">ডেমো কোড যাচাইকরণ</h1>
          <p className="text-xs text-gray-600">
            <span className="font-bold text-[#56020A]">{contact || '01712345678'}</span> নম্বরে পাঠানো ৬ ডিজিটের কোড দিন।
          </p>
          <p className="text-[11px] text-[#375013] font-semibold pt-1">
            (ডেমো কোড: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#EDD6A9]">123456</span>)
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6 pt-4">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`code-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(e.target.value, idx)}
                className="w-11 h-12 text-center text-lg font-bold bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A] shadow-sm"
              />
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#56020A] hover:bg-[#56020A]/90 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> যাচাই করা হচ্ছে...
              </span>
            ) : (
              <span>কোড যাচাই করুন</span>
            )}
          </button>
        </form>

        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-gray-500">
            কোড পাননি? {countdown > 0 ? `পুনরায় পাঠান (${countdown} সে.)` : (
              <button type="button" onClick={handleResend} className="text-[#56020A] font-bold underline">
                কোড পুনরায় পাঠান
              </button>
            )}
          </p>
          <button
            onClick={onChangeContact}
            className="text-xs text-[#375013] font-semibold hover:underline block mx-auto"
          >
            যোগাযোগ নম্বর পরিবর্তন করুন
          </button>
        </div>
      </div>
    </div>
  );
};
