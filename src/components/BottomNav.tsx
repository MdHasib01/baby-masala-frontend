import React, { useLayoutEffect, useRef, useState } from 'react';
import { Baby, Gift, House, ShoppingBag, LayoutGrid } from 'lucide-react';
import type { ActiveTab } from '../App';

const toBn = (n: number) => (n > 99 ? '৯৯+' : String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]));

// Same geometry as the Flutter app's _BottomBar (mobile/lib/features/shell/home_shell.dart).
const BAR_HEIGHT = 66;
const LIFT = 30; // rounded bump above the flat bar
const HOME_SIZE = 58;
const HOME_TOP = 8;
const CORNER = 24;
const BUMP_HALF = 54;
const PEAK = 2;

/** Top edge: rounded corners + a smooth bump in the middle that wraps the home circle. */
const topPath = (w: number) => {
  const c = w / 2;
  return [
    `M0 ${LIFT + CORNER}`,
    `Q0 ${LIFT} ${CORNER} ${LIFT}`,
    `L${c - BUMP_HALF} ${LIFT}`,
    `C${c - BUMP_HALF * 0.55} ${LIFT} ${c - BUMP_HALF * 0.62} ${PEAK} ${c} ${PEAK}`,
    `C${c + BUMP_HALF * 0.62} ${PEAK} ${c + BUMP_HALF * 0.55} ${LIFT} ${c + BUMP_HALF} ${LIFT}`,
    `L${w - CORNER} ${LIFT}`,
    `Q${w} ${LIFT} ${w} ${LIFT + CORNER}`,
  ].join(' ');
};

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenMore: () => void;
  moreActive?: boolean;
  cartCount?: number;
  moreBadge?: number;
}

/**
 * Phone-only bottom navigation, matching the Android app:
 * মাই বেবি · রিওয়ার্ডস · [হোম] · শপ · আরও — home is a raised maroon circle.
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenMore,
  moreActive = false,
  cartCount = 0,
  moreBadge = 0,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(390);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth || 390);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const homeOn = activeTab === 'home';
  const top = topPath(width);
  const h = LIFT + BAR_HEIGHT;

  const item = (
    Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>,
    label: string,
    on: boolean,
    onClick: () => void,
    badge = 0
  ) => (
    <button
      onClick={onClick}
      aria-current={on ? 'page' : undefined}
      className="flex-1 min-w-0 h-full flex flex-col items-center justify-center rounded-[18px] active:bg-[#EDD6A9]/20 transition-colors"
    >
      <span
        className={`relative px-4 py-1 rounded-[20px] transition-colors duration-200 ${on ? 'bg-[#EDD6A9]/55' : ''}`}
      >
        <Icon className={`w-[22px] h-[22px] ${on ? 'text-[#56020A]' : 'text-[#2D2327]/55'}`} strokeWidth={on ? 2.4 : 2} />
        {badge > 0 && (
          <span className="absolute top-[-3px] right-[7px] min-w-[17px] h-[17px] px-1 rounded-[10px] bg-[#DC2626] border-[1.5px] border-white text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {toBn(badge)}
          </span>
        )}
      </span>
      <span
        className={`mt-[3px] text-[11.5px] leading-tight truncate max-w-full ${
          on ? 'font-bold text-[#56020A]' : 'font-medium text-[#2D2327]/60'
        }`}
      >
        {label}
      </span>
    </button>
  );

  return (
    <nav
      ref={ref}
      aria-label="প্রধান নেভিগেশন"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 select-none font-hind"
      style={{ height: `calc(${h}px + env(safe-area-inset-bottom))` }}
    >
      {/* white bar with the rounded bump */}
      <svg
        className="absolute top-0 left-0 drop-shadow-[0_-3px_10px_rgba(86,2,10,0.07)]"
        width={width}
        height={h}
        viewBox={`0 0 ${width} ${h}`}
        aria-hidden="true"
      >
        <path d={`${top} L${width} ${h} L0 ${h} Z`} fill="#FFFFFF" />
        <path d={top} fill="none" stroke="rgba(237,214,169,0.7)" strokeWidth="1" />
      </svg>
      {/* safe-area fill below the bar */}
      <div className="absolute inset-x-0 bottom-0 bg-white" style={{ top: h - 1 }} />

      <div className="absolute inset-x-0 flex" style={{ top: LIFT, height: BAR_HEIGHT }}>
        {item(Baby, 'মাই বেবি', activeTab === 'baby', () => onChangeTab('baby'))}
        {item(Gift, 'রিওয়ার্ডস', activeTab === 'rewards', () => onChangeTab('rewards'))}
        <button
          onClick={() => onChangeTab('home')}
          className="flex-1 min-w-0 h-full flex items-end justify-center pb-[9px]"
          aria-hidden="true"
          tabIndex={-1}
        >
          <span className={`text-[11.5px] leading-tight ${homeOn ? 'font-bold text-[#56020A]' : 'font-medium text-[#2D2327]/60'}`}>
            হোম
          </span>
        </button>
        {item(ShoppingBag, 'শপ', activeTab === 'shop', () => onChangeTab('shop'), cartCount)}
        {item(LayoutGrid, 'আরও', moreActive, onOpenMore, moreBadge)}
      </div>

      {/* raised home circle */}
      <button
        onClick={() => onChangeTab('home')}
        aria-label="হোম"
        aria-current={homeOn ? 'page' : undefined}
        className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-[#56020A] flex items-center justify-center border-[3px] transition-all duration-200 active:scale-95 ${
          homeOn ? 'border-[#D6AA4F]' : 'border-[#56020A]'
        }`}
        style={{ top: HOME_TOP, width: HOME_SIZE, height: HOME_SIZE }}
      >
        <House className={`w-[26px] h-[26px] ${homeOn ? 'text-white' : 'text-[#EDD6A9]'}`} strokeWidth={2.2} />
      </button>
    </nav>
  );
};
