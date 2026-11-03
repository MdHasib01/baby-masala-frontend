import { useState } from 'react';

/**
 * Single post image sized like Facebook's feed: full width at the photo's own
 * aspect ratio, clamped between 4:5 (tallest portrait) and 1.91:1 (widest
 * landscape). Anything outside that range is center-cropped.
 */
const TALLEST = 4 / 5;
const WIDEST = 1.91;
const ratios = new Map<string, number>();

interface Props {
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export function FeedImage({ src, alt = 'Post attachment', className = '', onClick }: Props) {
  const [ratio, setRatio] = useState<number | undefined>(() => ratios.get(src));
  const shown = Math.min(WIDEST, Math.max(TALLEST, ratio ?? 1));

  return (
    <div className={`w-full overflow-hidden bg-gray-100 ${className}`} style={{ aspectRatio: shown }}>
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        onLoad={(e) => {
          const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
          if (w > 0 && h > 0) {
            ratios.set(src, w / h);
            setRatio(w / h);
          }
        }}
        className={`w-full h-full object-cover ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
      />
    </div>
  );
}
