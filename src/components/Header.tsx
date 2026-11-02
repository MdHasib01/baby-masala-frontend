import React from 'react';
import { Bell, MessageSquare, ShieldCheck, Home, Baby, Users, Gift, ShoppingBag, Download } from 'lucide-react';
import { User } from '../types';
import { ActiveTab } from '../App';
import { DownloadAppPill } from './download/DownloadApp';

const toBn = (n: number) => (n > 99 ? '৯৯+' : String(n).replace(/d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]));

interface HeaderProps {
  user: User;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenMessenger: () => void;
  onOpenAdmin: () => void;
  /** Phones: avatar opens the user's own timeline (like the app). */
  onOpenTimeline: () => void;
  onOpenDownload: () => void;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  friendRequestsCount?: number;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenProfile,
  onOpenNotifications,
  onOpenMessenger,
  onOpenAdmin,
  onOpenTimeline,
  onOpenDownload,
  unreadNotificationsCount,
  unreadMessagesCount,
  friendRequestsCount = 0,
  activeTab,
  onChangeTab,
  cartCount = 0,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'হোম', icon: Home },
    { id: 'baby' as ActiveTab, label: 'মাই বেবি', icon: Baby },
    { id: 'friends' as ActiveTab, label: 'ফ্রেন্ডস', icon: Users },
    { id: 'rewards' as ActiveTab, label: 'রিওয়ার্ডস', icon: Gift },
    { id: 'shop' as ActiveTab, label: 'শপ', icon: ShoppingBag, badge: cartCount },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FAF6F0] md:bg-[#FAF6F0]/95 md:backdrop-blur-md md:border-b md:border-[#EDD6A9]/50 md:shadow-sm">
      {/* ---- Phones: compact top bar, same as the Android app (home_shell.dart _TopBar) ---- */}
      <div className="md:hidden flex items-center gap-3 pl-4 pr-3 pb-2.5 pt-[max(10px,env(safe-area-inset-top))]">
        <button onClick={onOpenTimeline} className="relative shrink-0" aria-label="আমার প্রোফাইল">
          <span className="block w-[42px] h-[42px] rounded-full overflow-hidden border-2 border-[#EDD6A9] bg-[#EDD6A9]">
            {user.avatar && <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />}
          </span>
          {user.isMember && (
            <span className="absolute -right-0.5 -bottom-0.5 p-[2.5px] rounded-full bg-[#D6AA4F] border-2 border-[#FAF6F0] text-[#56020A]">
              <ShieldCheck className="w-2.5 h-2.5" />
            </span>
          )}
        </button>
        <button onClick={() => onChangeTab('home')} className="flex-1 min-w-0 flex items-center gap-2 text-left" aria-label="হোম">
          <img src="/logo.png" alt="" className="w-[30px] h-[30px] rounded-full object-cover shrink-0" />
          <span className="min-w-0">
            <span className="block text-[19px] font-extrabold text-[#56020A] leading-[1.1] truncate">Baby Care</span>
            <span className="block text-[9px] font-bold text-[#375013] tracking-[0.15em] leading-tight">BY BABY MASALA</span>
          </span>
        </button>
        <button
          onClick={onOpenDownload}
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-[#EDD6A9]/70 flex items-center justify-center text-[#56020A] active:bg-[#EDD6A9]/30"
          aria-label="অ্যাপ ডাউনলোড"
          title="অ্যাপ ডাউনলোড"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onOpenNotifications}
          className="relative shrink-0 w-10 h-10 rounded-full bg-white border border-[#EDD6A9]/70 flex items-center justify-center text-[#56020A] active:bg-[#EDD6A9]/30"
          aria-label="নোটিফিকেশন"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-[10px] bg-[#DC2626] border-[1.5px] border-white text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {toBn(unreadNotificationsCount)}
            </span>
          )}
        </button>
      </div>

      {/* ---- Tablets & desktop ---- */}
      <div className="hidden md:block">
      {/* Top Main Row */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Top Left: Mother's circular profile avatar */}
        <button
          onClick={onOpenProfile}
          className="relative group focus:outline-none flex items-center gap-2"
          title="প্রোফাইল মেনু খুলুন"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#56020A] shadow-sm bg-[#EDD6A9]">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          {user.isMember && (
            <span className="absolute -bottom-1 -right-1 bg-[#D6AA4F] text-[#56020A] rounded-full p-0.5 shadow-sm" title="প্রিমিয়াম মেম্বার">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          )}
        </button>

        {/* Center: Baby Care with 'by Baby Masala' subtitle & brand logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onOpenProfile}>
          <img
            src="/logo.png"
            alt="Baby Care Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-xs border border-[#EDD6A9]/80"
          />
          <div className="text-left">
            <h1 className="text-base sm:text-lg font-bold text-[#56020A] tracking-tight leading-none">Baby Care</h1>
            <p className="text-[9px] sm:text-[10px] font-semibold text-[#375013] mt-0.5 tracking-wider uppercase">
              by Baby Masala
            </p>
          </div>
        </div>

        {/* Top Right: Admin button, Friends, Messenger & Notification Bell */}
        <div className="flex items-center gap-1 sm:gap-2">
          <DownloadAppPill onClick={onOpenDownload} className="flex mr-1" />
          <button
            onClick={onOpenAdmin}
            className="text-[10px] sm:text-[11px] bg-[#EDD6A9]/60 hover:bg-[#EDD6A9] text-[#56020A] px-2 py-1.5 rounded-lg font-medium transition-colors border border-[#EDD6A9]"
            title="ডেমো অ্যাডমিন"
          >
            অ্যাডমিন
          </button>

          <button
            onClick={() => onChangeTab('friends')}
            className="relative p-2 rounded-full hover:bg-[#EDD6A9]/30 text-[#56020A] transition-colors"
            title="ফ্রেন্ডস"
          >
            <Users className="w-5 h-5" />
            {friendRequestsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#56020A] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {friendRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenMessenger}
            className="relative p-2 rounded-full hover:bg-[#EDD6A9]/30 text-[#56020A] transition-colors"
            title="মেসেঞ্জার"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#56020A] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full hover:bg-[#EDD6A9]/30 text-[#56020A] transition-colors"
            title="নোটিফিকেশন"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#56020A] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sticky Five Tabs Row Directly Below Header */}
      <nav aria-label="Top Navigation Tabs" className="bg-[#FAF6F0] border-t border-[#EDD6A9]/40">
        <div className="grid grid-cols-5 text-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 transition-all ${
                  isActive
                    ? 'text-[#56020A] bg-[#EDD6A9]/30 font-bold'
                    : 'text-[#2D2327]/70 hover:text-[#56020A] hover:bg-[#EDD6A9]/15 font-medium'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2 bg-[#56020A] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] sm:text-xs mt-0.5 tracking-tight truncate max-w-full px-0.5">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#56020A] rounded-t-full mx-auto w-3/4" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      </div>
    </header>
  );
};
