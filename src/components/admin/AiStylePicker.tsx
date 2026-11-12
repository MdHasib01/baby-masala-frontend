import React from 'react';
import { AiStyleGroup, AiStyles } from '../../services/babyCareService';

const STORAGE_KEY = 'admin.aiPersonaStyles';

export const allStyles = (groups: AiStyleGroup[]): AiStyles =>
  Object.fromEntries(groups.map((g) => [g.id, g.options.map((o) => o.id)]));

/** Last selection from this browser, limited to options that still exist; otherwise everything. */
export function savedStyles(groups: AiStyleGroup[], min: number): AiStyles {
  const all = allStyles(groups);
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as AiStyles | null;
    if (!saved) return all;
    return Object.fromEntries(
      groups.map((g) => {
        const picked = (saved[g.id] || []).filter((id) => all[g.id].includes(id));
        return [g.id, picked.length >= min ? picked : all[g.id]];
      })
    );
  } catch {
    return all;
  }
}

function remember(styles: AiStyles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
  } catch {
    /* private mode etc.: the selection just isn't remembered */
  }
}

/** "ফুল · ২৬–৩০ · গর্ভবতী …" for a batch item's combo. */
export function comboLabel(groups: AiStyleGroup[], combo?: Record<string, string>): string {
  if (!combo) return '';
  return groups
    .filter((g) => combo[g.id] && (g.id !== 'camera' || combo.picture === 'photo'))
    .map((g) => g.options.find((o) => o.id === combo[g.id])?.label || combo[g.id])
    .join(' · ');
}

interface Props {
  groups: AiStyleGroup[];
  value: AiStyles;
  min: number;
  disabled?: boolean;
  onChange: (styles: AiStyles) => void;
}

/**
 * Multi-select chips per style group for the AI user generator. Each group keeps
 * at least `min` options, so every batch mixes several looks.
 */
export const AiStylePicker: React.FC<Props> = ({ groups, value, min, disabled, onChange }) => {
  const set = (next: AiStyles) => {
    remember(next);
    onChange(next);
  };

  const toggle = (groupId: string, optionId: string) => {
    const current = value[groupId] || [];
    const on = current.includes(optionId);
    if (on && current.length <= min) return;
    set({ ...value, [groupId]: on ? current.filter((id) => id !== optionId) : [...current, optionId] });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700">ছবি ও প্রোফাইলের ধরন (প্রতিটি গ্রুপে অন্তত {min}টি)</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => set(allStyles(groups))}
          className="text-[11px] font-bold text-[#56020A] underline disabled:opacity-40"
        >
          সব বেছে নিন
        </button>
      </div>
      <p className="text-[11px] text-gray-500">
        প্রতিটি ইউজার আলাদা আলাদা কম্বিনেশন পাবে, যেমন কেউ সেলফি, কেউ শিশু কোলে, কেউ কার্টুন, কেউ শুধু ফুলের ছবি।
      </p>
      {groups.map((g) => {
        const selected = value[g.id] || [];
        return (
          <div key={g.id} className="flex flex-wrap items-center gap-1.5">
            <span className="w-28 shrink-0 font-semibold text-gray-600">
              {g.label} <span className="font-normal text-gray-400">({selected.length})</span>
            </span>
            {g.options.map((o) => {
              const on = selected.includes(o.id);
              const locked = on && selected.length <= min;
              return (
                <button
                  key={o.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={on}
                  onClick={() => toggle(g.id, o.id)}
                  title={locked ? `অন্তত ${min}টি লাগবে` : undefined}
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors disabled:opacity-40 ${
                    on
                      ? `bg-[#56020A] border-[#56020A] text-white ${locked ? 'cursor-not-allowed opacity-80' : ''}`
                      : 'bg-white border-[#EDD6A9] text-gray-600 hover:bg-[#EDD6A9]/30'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
