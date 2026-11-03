import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  X,
  Smartphone,
  ShieldCheck,
  Users,
  Baby,
  Gift,
  ChevronDown,
  QrCode,
  Apple,
} from 'lucide-react';
import { APP_DOWNLOAD_URL, APP_DOWNLOAD_FILENAME, APP_SIZE_LABEL, APP_VERSION } from '../../lib/config';

const toBn = (s: string) => s.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/** Absolute download URL, so the QR code works when scanned from another device. */
const absoluteDownloadUrl = () => {
  try {
    return new URL(APP_DOWNLOAD_URL, window.location.origin).toString();
  } catch {
    return APP_DOWNLOAD_URL;
  }
};

/** Plain <a download> styled as the primary maroon button. */
export const DownloadLink: React.FC<{ className?: string; children?: React.ReactNode; onClick?: () => void }> = ({
  className = '',
  children,
  onClick,
}) => (
  <a
    href={APP_DOWNLOAD_URL}
    download={APP_DOWNLOAD_FILENAME}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 bg-[#56020A] hover:bg-[#56020A]/90 active:scale-[0.98] text-white font-bold rounded-2xl transition-all ${className}`}
  >
    {children ?? (
      <>
        <Download className="w-4 h-4" />
        <span>অ্যাপ ডাউনলোড করুন</span>
      </>
    )}
  </a>
);

interface DownloadAppSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * "Get the app" sheet: slides up from the bottom on phones, centred card on
 * larger screens (with a QR code so desktop visitors can install on a phone).
 */
export const DownloadAppSheet: React.FC<DownloadAppSheetProps> = ({ isOpen, onClose }) => {
  const [showSteps, setShowSteps] = useState(false);
  const ios = useMemo(isIOS, []);
  const qrUrl = useMemo(absoluteDownloadUrl, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const features = [
    { icon: Users, label: 'মায়েদের কমিউনিটি', color: 'text-[#56020A] bg-[#56020A]/10' },
    { icon: Baby, label: 'শিশুর যত্ন ও খাবারের চার্ট', color: 'text-[#375013] bg-[#375013]/10' },
    { icon: Gift, label: 'পয়েন্ট, গিফট ও শপ', color: 'text-[#92400E] bg-[#D6AA4F]/20' },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center font-hind" role="dialog" aria-modal="true" aria-label="অ্যাপ ডাউনলোড">
      <div className="absolute inset-0 bg-black/55 animate-fade-in" onClick={onClose} />

      <div className="relative w-full sm:max-w-md md:max-w-2xl bg-[#FAF6F0] rounded-t-[28px] sm:rounded-[28px] shadow-2xl max-h-[92vh] overflow-y-auto animate-sheet-up sm:animate-pop-in pb-[env(safe-area-inset-bottom)]">
        {/* drag handle (phones) */}
        <div className="sm:hidden flex justify-center pt-2.5">
          <span className="w-10 h-1.5 rounded-full bg-[#EDD6A9]" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-[26px] right-[22px] sm:top-[22px] md:top-4 md:right-4 z-10 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white md:bg-white md:hover:bg-[#EDD6A9]/40 md:text-[#56020A] md:border md:border-[#EDD6A9] transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="md:grid md:grid-cols-[1fr_240px]">
          <div>
            {/* Hero */}
            <div className="mx-3 mt-2 sm:mt-3 rounded-3xl bg-gradient-to-br from-[#56020A] to-[#375013] text-white p-5 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -left-8 -bottom-12 w-32 h-32 rounded-full bg-[#D6AA4F]/10" />
              <div className="relative flex items-center gap-4">
                <div className="w-[72px] h-[72px] rounded-[22px] bg-white p-1 shadow-lg shrink-0">
                  <img src="/logo.png" alt="Baby Care" className="w-full h-full rounded-[18px] object-cover" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold leading-tight">Baby Care</h2>
                  <p className="text-[10px] font-bold tracking-[0.14em] text-[#EDD6A9]">BY BABY MASALA</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Android', 'ফ্রি', APP_SIZE_LABEL, `v${toBn(APP_VERSION)}`].map((chip) => (
                      <span key={chip} className="text-[10px] font-bold bg-white/15 rounded-full px-2 py-0.5">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="relative text-xs text-white/85 leading-relaxed mt-4">
                সব ফিচার এখন আপনার ফোনে — আরও দ্রুত, আরও সহজ। নোটিফিকেশন মিস হবে না।
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {features.map(({ icon: Icon, label, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-[#EDD6A9]/70 p-2.5 text-center">
                    <div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <p className="text-[10.5px] font-semibold text-[#2D2327] mt-1.5 leading-tight">{label}</p>
                  </div>
                ))}
              </div>

              {ios ? (
                <div className="flex items-start gap-3 bg-white border border-[#EDD6A9] rounded-2xl p-3">
                  <Apple className="w-5 h-5 text-[#56020A] shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 leading-relaxed">
                    iPhone অ্যাপ শীঘ্রই আসছে। এখনকার অ্যাপটি শুধু <b>Android</b> ফোনের জন্য — ততদিন এই ওয়েবসাইটেই সব ফিচার ব্যবহার করুন।
                  </p>
                </div>
              ) : (
                <DownloadLink className="w-full py-3.5 text-sm shadow-lg shadow-[#56020A]/20">
                  <Download className="w-5 h-5" />
                  <span>অ্যাপ ডাউনলোড করুন</span>
                  <span className="text-[11px] font-semibold text-[#EDD6A9]">· {APP_SIZE_LABEL}</span>
                </DownloadLink>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#375013] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Baby Masala-র অফিসিয়াল অ্যাপ</span>
              </div>

              {/* Install steps */}
              <div className="bg-white rounded-2xl border border-[#EDD6A9]/70 overflow-hidden">
                <button
                  onClick={() => setShowSteps((s) => !s)}
                  className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-bold text-[#56020A]"
                  aria-expanded={showSteps}
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> কীভাবে ইনস্টল করবেন?
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
                </button>
                {showSteps && (
                  <ol className="px-3.5 pb-3.5 space-y-2.5">
                    {[
                      'উপরের বাটনে চাপ দিয়ে BabyCare.apk ফাইলটি ডাউনলোড করুন।',
                      'ডাউনলোড শেষ হলে নোটিফিকেশন বা Downloads ফোল্ডার থেকে ফাইলটি খুলুন।',
                      'অনুমতি চাইলে "এই উৎস থেকে ইনস্টল করার অনুমতি দিন" চালু করুন।',
                      '"ইনস্টল" চাপুন — এরপর অ্যাপ খুলে আপনার অ্যাকাউন্টে লগইন করুন।',
                      'Play Protect সতর্কতা দেখালে "আরও বিস্তারিত" → "তবুও ইনস্টল করুন" চাপুন। অ্যাপটি Nukta Technologies-এর স্বাক্ষর করা।',
                      '"অ্যাপ ইনস্টল হয়নি" দেখালে: Play Store থেকে নেওয়া পুরনো BabyCare অ্যাপ থাকলে সেটি আনইনস্টল করে আবার চেষ্টা করুন।',
                    ].map((step, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-gray-700 leading-relaxed">
                        <span className="w-5 h-5 shrink-0 rounded-full bg-[#EDD6A9]/60 text-[#56020A] text-[10px] font-bold flex items-center justify-center">
                          {toBn(String(i + 1))}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>

          {/* QR code (tablet / desktop) */}
          <div className="hidden md:flex flex-col items-center justify-center gap-3 p-5 md:pl-0">
            <div className="bg-white rounded-3xl border border-[#EDD6A9] p-4 shadow-sm">
              <QRCodeSVG value={qrUrl} size={176} fgColor="#56020A" bgColor="#FFFFFF" level="M" marginSize={0} />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-[#56020A] flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4" /> ফোনে স্ক্যান করুন
              </p>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed max-w-[200px]">
                ফোনের ক্যামেরা দিয়ে স্ক্যান করলেই অ্যাপ ডাউনলোড শুরু হবে
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BANNER_KEY = 'bc_app_banner_hidden_until';
const BANNER_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/**
 * Phone-only smart banner under the top bar ("Baby Care অ্যাপ · ডাউনলোড").
 * Dismissing it hides it for three days; the download stays in "আরও" and the
 * top bar either way.
 */
export const DownloadAppBanner: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const [hidden, setHidden] = useState(() => {
    if (isIOS()) return true;
    try {
      return Number(localStorage.getItem(BANNER_KEY) || 0) > Date.now();
    } catch {
      return false;
    }
  });

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(BANNER_KEY, String(Date.now() + BANNER_SNOOZE_MS));
    } catch {
      /* storage blocked — banner just returns next visit */
    }
  };

  return (
    <div className="md:hidden px-3 pt-2.5 animate-fade-in">
      <div className="flex items-center gap-2.5 bg-white border border-[#EDD6A9] rounded-2xl pl-2 pr-1.5 py-2 shadow-sm">
        <button onClick={dismiss} className="p-1 text-gray-400 hover:text-gray-600 shrink-0" aria-label="বন্ধ করুন">
          <X className="w-4 h-4" />
        </button>
        <button onClick={onOpen} className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
          <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl object-cover border border-[#EDD6A9] shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#56020A] leading-tight truncate">Baby Care অ্যাপ</p>
            <p className="text-[10.5px] text-gray-500 leading-tight mt-0.5 truncate">Android · ফ্রি · আরও দ্রুত ও সহজ</p>
          </div>
        </button>
        <button
          onClick={onOpen}
          className="shrink-0 flex items-center gap-1.5 bg-[#56020A] text-white text-xs font-bold rounded-full px-3.5 py-2 active:scale-95 transition-transform"
        >
          <Download className="w-3.5 h-3.5" />
          ডাউনলোড
        </button>
      </div>
    </div>
  );
};

/** Compact pill for the desktop header. */
export const DownloadAppPill: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`items-center gap-1.5 bg-gradient-to-r from-[#56020A] to-[#375013] hover:brightness-110 text-white text-xs font-bold rounded-full px-3.5 py-2 shadow-sm transition-all ${className}`}
    title="অ্যাপ ডাউনলোড করুন"
  >
    <Smartphone className="w-4 h-4" />
    <span>অ্যাপ ডাউনলোড</span>
  </button>
);
