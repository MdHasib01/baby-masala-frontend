import React from 'react';
import { Bell, MessageSquare, ShieldCheck, Home, Baby, Users, Gift, ShoppingBag } from 'lucide-react';
import { User } from '../types';
import { ActiveTab } from '../App';

interface HeaderProps {
  user: User;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenMessenger: () => void;
  onOpenAdmin: () => void;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
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
  unreadNotificationsCount,
  unreadMessagesCount,
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
    <header className="sticky top-0 z-30 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#EDD6A9]/50 shadow-sm">
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

        {/* Top Right: Messenger icon, Notification Bell & Admin button */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenAdmin}
            className="text-[10px] sm:text-[11px] bg-[#EDD6A9]/60 hover:bg-[#EDD6A9] text-[#56020A] px-2 py-1.5 rounded-lg font-medium transition-colors border border-[#EDD6A9]"
            title="ডেমো অ্যাডমিন"
          >
            অ্যাডমিন
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
    </header>
  );
};
