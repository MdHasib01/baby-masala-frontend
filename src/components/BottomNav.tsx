import React from 'react';
import { Users, Baby, Utensils, Gift, ShoppingBag } from 'lucide-react';

export type ActiveTab = 'community' | 'baby' | 'recipes' | 'rewards' | 'shop';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  cartCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, cartCount = 0 }) => {
  const tabs = [
    { id: 'community' as ActiveTab, label: 'কমিউনিটি', icon: Users },
    { id: 'baby' as ActiveTab, label: 'মাই বেবি', icon: Baby },
    { id: 'recipes' as ActiveTab, label: 'রেসিপি', icon: Utensils },
    { id: 'rewards' as ActiveTab, label: 'রিওয়ার্ডস', icon: Gift },
    { id: 'shop' as ActiveTab, label: 'শপ', icon: ShoppingBag, badge: cartCount },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6F0] border-t border-[#EDD6A9] shadow-lg max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#56020A] bg-[#EDD6A9]/40 font-bold scale-105'
                  : 'text-[#2D2327]/70 hover:text-[#56020A] hover:bg-[#EDD6A9]/20 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#56020A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-[#56020A] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
