import React, { useEffect, useRef, useState } from 'react';
import { Apple, Baby, Heart, Smile, SmilePlus } from 'lucide-react';

/** Curated emoji sets (no package needed). Keep in sync with mobile/lib/shared/widgets/emoji_picker.dart. */
const CATEGORIES: { icon: React.ElementType; emojis: string[] }[] = [
  {
    icon: Smile,
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘',
      '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😌',
      '😴', '🥱', '😷', '🤒', '🤕', '🥴', '😵', '🥳', '😎', '🤓', '😕', '😟', '🙁', '😮', '😯', '😲',
      '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫',
    ],
  },
  {
    icon: Heart,
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
      '💟', '❣️', '💔', '🫶', '🤲', '🙏', '👏', '🙌', '👍', '👎', '👌', '✌️', '🤞', '💪', '👋', '🤝',
    ],
  },
  {
    icon: Baby,
    emojis: [
      '👶', '🍼', '🤱', '👩‍🍼', '🤰', '👪', '👨‍👩‍👧', '👨‍👩‍👦', '🧸', '🎀', '🧷', '🛁', '🛏️', '😴', '💤', '🌙',
      '⭐', '🌟', '✨', '🎈', '🎉', '🎂', '🎁', '🌸', '🌼', '🌻', '🌈', '☀️', '🦋', '🐣', '🐥', '🐻',
    ],
  },
  {
    icon: Apple,
    emojis: [
      '🍎', '🍌', '🍉', '🍇', '🍓', '🥭', '🍍', '🥥', '🥝', '🍐', '🍊', '🍋', '🥑', '🥕', '🌽', '🥦',
      '🥔', '🍠', '🎃', '🥚', '🍚', '🍲', '🥣', '🥛', '🧃', '🍯', '🍪', '🧁', '🍰', '🍞', '🧀', '🍗',
    ],
  },
];

type Field = HTMLInputElement | HTMLTextAreaElement;

/** Inserts `text` at the field's cursor and returns the new value. */
export function insertAtCursor(field: Field | null, value: string, text: string): string {
  if (!field) return value + text;
  const start = field.selectionStart ?? value.length;
  const end = field.selectionEnd ?? value.length;
  const next = value.slice(0, start) + text + value.slice(end);
  requestAnimationFrame(() => {
    field.focus();
    field.setSelectionRange(start + text.length, start + text.length);
  });
  return next;
}

interface EmojiButtonProps {
  /** The input/textarea the emoji goes into. */
  fieldRef: React.RefObject<Field | null>;
  value: string;
  onChange: (value: string) => void;
  /** Which way the panel opens. */
  placement?: 'top' | 'bottom';
  className?: string;
}

/** Facebook-style smiley button with a small emoji panel. The panel stays open for several picks. */
export const EmojiButton: React.FC<EmojiButtonProps> = ({ fieldRef, value, onChange, placement = 'top', className = '' }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        title="ইমোজি"
        aria-label="ইমোজি"
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-full text-[#D6AA4F] hover:bg-[#EDD6A9]/30 transition-colors"
      >
        <SmilePlus className="w-5 h-5" />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-[#EDD6A9] overflow-hidden animate-reaction-bar-in ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="flex justify-around border-b border-[#EDD6A9]/60">
            {CATEGORIES.map((c, i) => {
              const Icon = c.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTab(i)}
                  className={`flex-1 py-2 flex justify-center ${i === tab ? 'text-[#56020A] border-b-2 border-[#56020A]' : 'text-gray-400'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-8 gap-0.5 p-2 max-h-52 overflow-y-auto">
            {CATEGORIES[tab].emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onChange(insertAtCursor(fieldRef.current, valueRef.current, e))}
                className="text-xl h-8 rounded-lg hover:bg-[#FAF6F0] hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
