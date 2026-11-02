import React, { useEffect, useState } from 'react';
import {
  Utensils,
  Users,
  MessageSquare,
  Stethoscope,
  Bell,
  Gift,
  MapPin,
  MessageSquareWarning,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  Baby,
  Download,
} from 'lucide-react';
import { User, Child, RewardTransaction, GiftRedemption } from '../types';
import type { ActiveTab } from '../App';
import { AddressManagerModal } from './profile/AddressManagerModal';
import { SettingsModal } from './profile/SettingsModal';
import { ComplaintsModal } from './profile/ComplaintsModal';
import { APP_SIZE_LABEL, APP_VERSION } from '../lib/config';

const toBn = (v: number | string) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (user: User) => void;
  childrenList: Child[];
  rewardTx: RewardTransaction[];
  giftRedemptions: GiftRedemption[];
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  friendRequestsCount: number;
  onNavigateTab: (tab: ActiveTab) => void;
  onNavigateScreen: (screen: 'messenger' | 'doctor' | 'recipes') => void;
  onOpenTimeline: () => void;
  onOpenNotifications: () => void;
  onOpenDownload: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

interface Item {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string; // hex
  onClick: () => void;
  badge?: number;
}

/**
 * "আরও" (More) sheet for phones — same layout as the Android app's
 * more_sheet.dart: gradient profile card, a 3-column grid of every option,
 * the app download card, logout and legal links.
 */
export const MoreSheet: React.FC<MoreSheetProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  childrenList,
  rewardTx,
  giftRedemptions,
  unreadNotificationsCount,
  unreadMessagesCount,
  friendRequestsCount,
  onNavigateTab,
  onNavigateScreen,
  onOpenTimeline,
  onOpenNotifications,
  onOpenDownload,
  onOpenAdmin,
  onLogout,
}) => {
  const [modal, setModal] = useState<'address' | 'settings' | 'complaints' | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

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

  const then = (fn: () => void) => () => {
    onClose();
    fn();
  };

  const earned = rewardTx.filter((t) => t.type === 'earn').reduce((a, b) => a + b.points, 0);
  const spent = giftRedemptions.reduce((a, b) => a + b.pointsCost, 0);
  const availablePoints = earned - spent;
  const child = childrenList[0];

  const items: Item[] = [
    { icon: Utensils, label: 'রেসিপি ও টিপস', color: '#92400E', onClick: then(() => onNavigateScreen('recipes')) },
    { icon: Users, label: 'ফ্রেন্ডস', color: '#375013', onClick: then(() => onNavigateTab('friends')), badge: friendRequestsCount },
    { icon: MessageSquare, label: 'মেসেঞ্জার', color: '#56020A', onClick: then(() => onNavigateScreen('messenger')), badge: unreadMessagesCount },
    { icon: Stethoscope, label: 'ডাক্তারকে জিজ্ঞেস করুন', color: '#DC2626', onClick: then(() => onNavigateScreen('doctor')) },
    { icon: Bell, label: 'নোটিফিকেশন', color: '#56020A', onClick: then(onOpenNotifications), badge: unreadNotificationsCount },
    { icon: Gift, label: 'পয়েন্ট ও গিফট', color: '#D6AA4F', onClick: then(() => onNavigateTab('rewards')) },
    { icon: MapPin, label: 'ঠিকানা', color: '#15803D', onClick: then(() => setModal('address')) },
    { icon: MessageSquareWarning, label: 'অভিযোগ ও সাপোর্ট', color: '#DC2626', onClick: then(() => setModal('complaints')) },
    { icon: Settings, label: 'সেটিংস ও গোপনীয়তা', color: '#4B5563', onClick: then(() => setModal('settings')) },
    ...(user.isAdmin ? [{ icon: Shield, label: 'অ্যাডমিন', color: '#DC2626', onClick: then(onOpenAdmin) }] : []),
  ];

  return (
    <>
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end font-hind" role="dialog" aria-modal="true" aria-label="আরও">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

          <div className="relative w-full max-h-[90vh] overflow-y-auto bg-[#FAF6F0] rounded-t-[28px] shadow-2xl animate-sheet-up px-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
            {/* handle */}
            <button onClick={onClose} className="w-full flex justify-center pt-2.5 pb-3" aria-label="বন্ধ করুন">
              <span className="w-10 h-1.5 rounded-full bg-[#EDD6A9]" />
            </button>

            {/* Profile card → own timeline */}
            <div
              role="button"
              tabIndex={0}
              onClick={then(onOpenTimeline)}
              onKeyDown={(e) => e.key === 'Enter' && then(onOpenTimeline)()}
              className="rounded-3xl bg-gradient-to-br from-[#56020A] to-[#375013] p-4 text-white cursor-pointer active:brightness-110 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-[54px] h-[54px] rounded-full border-2 border-[#D6AA4F] overflow-hidden shrink-0 bg-[#EDD6A9]">
                  {user.avatar && <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-bold truncate">{user.name}</p>
                  <p className="text-xs font-semibold text-[#EDD6A9] truncate mt-0.5">{user.contact}</p>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0" />
              </div>
              <div className="flex gap-2 mt-3.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    then(() => onNavigateTab('rewards'))();
                  }}
                  className="flex-1 min-w-0 flex items-center gap-1.5 bg-white/[0.14] rounded-[14px] px-2.5 py-2.5 text-left"
                >
                  <Sparkles className="w-[15px] h-[15px] text-[#D6AA4F] shrink-0" />
                  <span className="text-xs font-bold truncate">{toBn(availablePoints)} পয়েন্ট</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    then(() => onNavigateTab('baby'))();
                  }}
                  className="flex-1 min-w-0 flex items-center gap-1.5 bg-white/[0.14] rounded-[14px] px-2.5 py-2.5 text-left"
                >
                  <Baby className="w-[15px] h-[15px] text-[#D6AA4F] shrink-0" />
                  <span className="text-xs font-bold truncate">{child?.name || 'শিশু যোগ করুন'}</span>
                </button>
              </div>
            </div>

            {/* Download the app */}
            <button
              onClick={then(onOpenDownload)}
              className="mt-3 w-full flex items-center gap-3 bg-white border border-[#EDD6A9] rounded-[20px] p-3 text-left active:scale-[0.99] transition-transform"
            >
              <img src="/logo.png" alt="" className="w-11 h-11 rounded-[14px] object-cover border border-[#EDD6A9] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#56020A] leading-tight">Baby Care অ্যাপ ডাউনলোড করুন</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Android · ফ্রি · {APP_SIZE_LABEL}</p>
              </div>
              <span className="shrink-0 w-9 h-9 rounded-full bg-[#56020A] text-white flex items-center justify-center">
                <Download className="w-4 h-4" />
              </span>
            </button>

            <p className="text-[13px] font-bold text-gray-500 pl-1 mt-[18px] mb-2.5">সব অপশন</p>
            <div className="grid grid-cols-3 gap-2.5">
              {items.map((i) => {
                const Icon = i.icon;
                return (
                  <button
                    key={i.label}
                    onClick={i.onClick}
                    className="bg-white rounded-[20px] border border-[#EDD6A9]/55 px-2 py-3 flex flex-col items-center justify-center min-h-[104px] active:bg-[#FAF6F0] transition-colors"
                  >
                    <span
                      className="relative w-[46px] h-[46px] rounded-[15px] flex items-center justify-center"
                      style={{ backgroundColor: `${i.color}1A`, color: i.color }}
                    >
                      <Icon className="w-[22px] h-[22px]" />
                      {!!i.badge && i.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-[10px] bg-[#DC2626] border-[1.5px] border-white text-white text-[9px] font-bold flex items-center justify-center leading-none">
                          {i.badge > 99 ? '৯৯+' : toBn(i.badge)}
                        </span>
                      )}
                    </span>
                    <span className="mt-2 text-[11.5px] font-semibold text-[#2D2327] text-center leading-[1.25] line-clamp-2">
                      {i.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setConfirmLogout(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white text-[#DC2626] border border-[#DC2626]/25 rounded-2xl text-sm font-bold"
            >
              <LogOut className="w-[17px] h-[17px]" />
              লগআউট
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <img src="/logo.png" alt="" className="w-4 h-4 rounded-full object-cover" />
              <p className="text-[10.5px] text-gray-400">Baby Care by Baby Masala</p>
            </div>
            <p className="text-center text-[10.5px] text-gray-400 mt-1">
              সংস্করণ {toBn(APP_VERSION)} ·{' '}
              <a href="/privacy-policy.html" className="font-semibold text-gray-500 underline">
                গোপনীয়তা নীতি
              </a>{' '}
              ·{' '}
              <a href="/terms.html" className="font-semibold text-gray-500 underline">
                শর্তাবলী
              </a>
            </p>
          </div>
        </div>
      )}

      {confirmLogout && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 font-hind">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-[#EDD6A9] animate-pop-in">
            <h4 className="font-bold text-[#56020A] text-base">লগআউট করবেন?</h4>
            <p className="text-xs text-gray-600">আবার লগইন করে আপনার অ্যাকাউন্টে ফিরতে পারবেন।</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmLogout(false)} className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl text-xs">
                বাতিল
              </button>
              <button
                onClick={() => {
                  setConfirmLogout(false);
                  onClose();
                  onLogout();
                }}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs"
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>
      )}

      <AddressManagerModal user={user} onUpdateUser={onUpdateUser} isOpen={modal === 'address'} onClose={() => setModal(null)} />
      <ComplaintsModal isOpen={modal === 'complaints'} onClose={() => setModal(null)} />
      <SettingsModal
        user={user}
        onUpdateUser={onUpdateUser}
        isOpen={modal === 'settings'}
        onClose={() => setModal(null)}
        onLogout={onLogout}
      />
    </>
  );
};
