import React, { useEffect, useRef, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Post, ReactionType } from '../../types';

/** Reaction type → emoji, Bengali label, accent colour. Order = picker order (same as mobile). */
export const REACTIONS: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: '👍', label: 'লাইক', color: '#2563EB' },
  love: { emoji: '❤️', label: 'লাভ', color: '#E11D48' },
  haha: { emoji: '😆', label: 'হাহা', color: '#D97706' },
  care: { emoji: '🤗', label: 'কেয়ার', color: '#D97706' },
};
const TYPES = Object.keys(REACTIONS) as ReactionType[];

/** The viewer's reaction (posts from older servers only have likedByMe). */
export const myReactionOf = (p: Post): ReactionType | null => p.myReaction ?? (p.likedByMe ? 'like' : null);

/** Optimistic local version of `POST /posts/:id/react {type}`. */
export function applyReaction(p: Post, type: ReactionType): Post {
  const counts = { ...(p.reactionCounts || {}) };
  const current = myReactionOf(p);
  const bump = (t: ReactionType, by: number) => (counts[t] = Math.max(0, (counts[t] || 0) + by));
  let next: ReactionType | null = type;
  let likes = p.likes;
  if (current === type) {
    bump(type, -1);
    next = null;
    likes--;
  } else if (!current) {
    bump(type, 1);
    likes++;
  } else {
    bump(current, -1);
    bump(type, 1);
  }
  return { ...p, likes: Math.max(0, likes), likedByMe: next !== null, myReaction: next, reactionCounts: counts };
}

/** Types present on the post, most used first. */
export function topReactions(p: Post): ReactionType[] {
  const entries = TYPES.map((t) => [t, p.reactionCounts?.[t] || 0] as const).filter(([, n]) => n > 0);
  if (!entries.length && p.likes > 0) return ['like'];
  return entries.sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

/** "👍❤️ ১২" — stacked emoji plus the total. */
export const ReactionSummary: React.FC<{ post: Post }> = ({ post }) => {
  if (post.likes <= 0) return <span />;
  return (
    <span className="flex items-center gap-1">
      <span className="flex -space-x-1">
        {topReactions(post)
          .slice(0, 3)
          .map((t) => (
            <span key={t} className="w-5 h-5 rounded-full bg-white ring-2 ring-white flex items-center justify-center text-[11px]">
              {REACTIONS[t].emoji}
            </span>
          ))}
      </span>
      <span>{post.likes.toLocaleString('bn-BD')}</span>
    </span>
  );
};

interface ReactionButtonProps {
  current: ReactionType | null;
  onReact: (type: ReactionType) => void;
}

const HOVER_OPEN_MS = 450;
const LONG_PRESS_MS = 450;

/**
 * Facebook-style react button. Click = like (or remove your reaction).
 * Desktop: hover to open the picker. Touch: long-press, slide to an emoji, release.
 * Picking plays a pop on the button and a short burst of floating emoji.
 */
export const ReactionButton: React.FC<ReactionButtonProps> = ({ current, onReact }) => {
  const [open, setOpen] = useState(false);
  const [openedByTouch, setOpenedByTouch] = useState(false);
  const [hovered, setHovered] = useState<ReactionType | null>(null);
  const [popKey, setPopKey] = useState(0);
  const [bursts, setBursts] = useState<{ id: number; emoji: string }[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pick = (type: ReactionType) => {
    window.clearTimeout(timer.current);
    setOpen(false);
    setOpenedByTouch(false);
    setHovered(null);
    const adding = current !== type;
    onReact(type);
    if (adding) {
      setPopKey((k) => k + 1);
      const id = Date.now();
      setBursts((b) => [...b, { id, emoji: REACTIONS[type].emoji }]);
      window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1000);
    }
  };

  const typeAt = (x: number, y: number): ReactionType | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const t = el?.closest<HTMLElement>('[data-reaction]')?.dataset.reaction;
    return (t as ReactionType) || null;
  };

  const info = current ? REACTIONS[current] : null;

  return (
    <div
      className="relative flex-1"
      onMouseEnter={(e) => {
        if ((e.nativeEvent as PointerEvent).pointerType === 'touch') return;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpen(true), HOVER_OPEN_MS);
      }}
      onMouseLeave={() => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpen(false), 300);
      }}
    >
      {open && (
        <div
          ref={barRef}
          className="absolute bottom-full left-0 mb-2 z-30 flex items-center gap-1 bg-white rounded-full px-2 py-1.5 shadow-xl border border-[#EDD6A9] animate-reaction-bar-in"
          onMouseEnter={() => window.clearTimeout(timer.current)}
        >
          {TYPES.map((t, i) => (
            <button
              key={t}
              type="button"
              data-reaction={t}
              onClick={() => pick(t)}
              onMouseEnter={() => setHovered(t)}
              onMouseLeave={() => setHovered(null)}
              className="relative w-10 h-10 flex items-center justify-center text-[28px] animate-reaction-item-in"
              style={{ animationDelay: `${i * 40}ms` }}
              aria-label={REACTIONS[t].label}
            >
              <span className={`transition-transform duration-150 ${hovered === t ? 'scale-150 -translate-y-1' : ''}`}>
                {REACTIONS[t].emoji}
              </span>
              {hovered === t && (
                <span className="absolute -top-7 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[10px] font-bold whitespace-nowrap">
                  {REACTIONS[t].label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          // A long-press already opened the picker; don't also toggle.
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          pick(current ?? 'like');
        }}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={() => {
          longPressed.current = false;
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => {
            longPressed.current = true;
            setOpenedByTouch(true);
            setOpen(true);
            navigator.vibrate?.(15);
          }, LONG_PRESS_MS);
        }}
        onTouchMove={(e) => {
          if (!longPressed.current) return;
          const t = e.touches[0];
          setHovered(typeAt(t.clientX, t.clientY));
        }}
        onTouchEnd={(e) => {
          window.clearTimeout(timer.current);
          if (!longPressed.current) return;
          e.preventDefault();
          const t = e.changedTouches[0];
          const type = typeAt(t.clientX, t.clientY);
          // Released over an emoji → pick it; otherwise keep the bar open for a tap.
          if (type) pick(type);
          setHovered(null);
          longPressed.current = false;
        }}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-gray-100 select-none"
        style={{ color: info?.color ?? '#4B5563', touchAction: 'manipulation' }}
      >
        <span key={popKey} className={popKey ? 'inline-block animate-reaction-pop' : 'inline-block'}>
          {info ? <span className="text-base leading-none">{info.emoji}</span> : <ThumbsUp className="w-4 h-4" />}
        </span>
        <span className={info ? 'font-bold' : ''}>{info?.label ?? 'লাইক'}</span>
      </button>

      {bursts.map((b) =>
        [0, 1, 2, 3, 4].map((i) => (
          <span
            key={`${b.id}-${i}`}
            className="pointer-events-none absolute left-6 top-1 text-lg animate-reaction-float"
            style={{ animationDelay: `${i * 70}ms`, ['--dx' as string]: `${(i - 2) * 16}px` }}
          >
            {b.emoji}
          </span>
        ))
      )}

      {/* Tap outside closes a picker opened by long-press. */}
      {open && openedByTouch && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setOpen(false);
            setOpenedByTouch(false);
          }}
        />
      )}
    </div>
  );
};
