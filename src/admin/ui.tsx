import React from 'react';
import { Inbox, Search } from 'lucide-react';

/** Bengali digits with thousands separators, e.g. ১২,৩৪৫. */
export const bn = (n: number) => n.toLocaleString('bn-BD');

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white rounded-2xl border border-[#EDD6A9]/70 shadow-[0_1px_2px_rgba(86,2,10,0.04)] ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({
  title,
  subtitle,
  actions,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
    <div>
      <h2 className="text-xl font-bold text-[#2D2327]">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const SearchInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string }> = ({
  value,
  onChange,
  placeholder,
}) => (
  <label className="relative block w-full sm:w-64">
    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]/20 focus:border-[#56020A]/40"
    />
  </label>
);

/** Segmented filter, e.g. সব / AI / রিপোর্টেড. */
export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="flex gap-1 p-1 bg-[#EDD6A9]/30 rounded-xl overflow-x-auto max-w-full">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            value === o.value ? 'bg-white text-[#56020A] shadow-sm' : 'text-gray-600 hover:text-[#56020A]'
          }`}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1 opacity-60">{bn(o.count)}</span>}
        </button>
      ))}
    </div>
  );
}

export const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <Card className="py-12 flex flex-col items-center justify-center text-center text-gray-400">
    <Inbox className="w-8 h-8 mb-2" />
    <p className="text-sm">{text}</p>
  </Card>
);

export const Pill: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${className}`}>
    {children}
  </span>
);

export const selectClass =
  'text-xs border border-[#EDD6A9] rounded-lg px-2 py-1.5 bg-white font-semibold text-[#56020A] focus:outline-none focus:ring-2 focus:ring-[#56020A]/20';
