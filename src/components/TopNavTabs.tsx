import React from 'react';
import { Users, Baby, Utensils, Gift, ShoppingBag } from 'lucide-react';
import { ActiveTab } from './BottomNav';

interface TopNavTabsProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  cartCount?: number;
}

export const TopNavTabs: React.FC<TopNavTabsProps> = ({ activeTab, onChangeTab, cartCount = 0 }) => {
  const tabs = [
    { id: 'community' as ActiveTab, label: 'কমিউনিটি', icon: Users },
    { id: 'baby' as ActiveTab, label: 'মাই বেবি', icon: Baby },
    { id: 'recipes' as ActiveTab, label: 'রেসিপি', icon: Utensils },
    { id: 'rewards' as ActiveTab, label: 'রিওয়ার্ডস', icon: Gift },
    { id: 'shop' as ActiveTab, label: 'শপ', icon: ShoppingBag, badge: cartCount },
  ];

  return (
    <nav aria-label="Top Tab Navigation" className="sticky top-[57px] sm:top-[61px] z-20 bg-[#FAF6F0] border-b border-[#EDD6A9] shadow-sm">
      <div className="flex items-center justify-around px-1 max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 px-1 relative transition-all ${
                isActive
                  ? 'text-[#56020A] bg-[#EDD6A9]/20 font-bold'
                  : 'text-[#2D2327]/70 hover:text-[#56020A] hover:bg-[#EDD6A9]/10 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#56020A] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-full">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#56020A] rounded-t-full mx-2" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
