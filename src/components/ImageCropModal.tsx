import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { loadImage, renderToDataUrl } from '../lib/image';

interface ImageCropModalProps {
  file: File;
  /** Frame width / height — 1 for profile pictures, wider for covers. */
  aspect: number;
  /** Round frame (profile picture). The result is still a square image. */
  circle?: boolean;
  outputWidth: number;
  title: string;
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
}

const MAX_ZOOM = 4;

/**
 * Facebook-style crop: drag to move, scroll / pinch / slider to zoom.
 * Zoom is relative to "cover" fit (1 = the photo just fills the frame);
 * offset is the photo centre relative to the frame centre, in screen px.
 */
export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  file,
  aspect,
  circle = false,
  outputWidth,
  title,
  onCancel,
  onDone,
}) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState('');
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    loadImage(url).then(setImg, (e) => setError(e.message));
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const measure = () => {
      const pad = 24;
      let w = el.clientWidth - pad * 2;
      let h = w / aspect;
      if (h > el.clientHeight - pad * 2) {
        h = el.clientHeight - pad * 2;
        w = h * aspect;
      }
      setFrame({ w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect, img]);

  const baseScale = img && frame.w ? Math.max(frame.w / img.naturalWidth, frame.h / img.naturalHeight) : 1;

  const clamp = (o: { x: number; y: number }, z: number) => {
    if (!img) return o;
    const s = baseScale * z;
    const maxX = Math.max(0, (img.naturalWidth * s - frame.w) / 2);
    const maxY = Math.max(0, (img.naturalHeight * s - frame.h) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) };
  };

  // Keep the view valid when the frame is resized.
  useEffect(() => setOffset((o) => clamp(o, zoom)), [frame.w, frame.h]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyZoom = (next: number) => {
    const z = Math.min(MAX_ZOOM, Math.max(1, next));
    setOffset((o) => clamp({ x: (o.x * z) / zoom, y: (o.y * z) / zoom }, z));
    setZoom(z);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      applyZoom((pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.dist);
    } else if (pointers.current.size === 1) {
      setOffset((o) => clamp({ x: o.x + cur.x - prev.x, y: o.y + cur.y - prev.y }, zoom));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const handleDone = () => {
    if (!img || saving) return;
    setSaving(true);
    try {
      const s = baseScale * zoom;
      const src = {
        x: img.naturalWidth / 2 - (frame.w / 2 + offset.x) / s,
        y: img.naturalHeight / 2 - (frame.h / 2 + offset.y) / s,
        w: frame.w / s,
        h: frame.h / s,
      };
      // Never upscale beyond the source pixels.
      const outW = Math.round(Math.min(outputWidth, src.w));
      onDone(renderToDataUrl(img, src, outW, outW / aspect));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ছবিটি সেভ করা যায়নি।');
      setSaving(false);
    }
  };

  const s = baseScale * zoom;

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 text-white">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10" title="বাতিল">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-sm font-bold">{title}</h3>
        <button
          onClick={handleDone}
          disabled={!img || saving}
          className="px-3 py-1.5 rounded-lg text-sm font-bold text-[#EDD6A9] hover:bg-white/10 disabled:opacity-40"
        >
          {saving ? '...' : 'সম্পন্ন'}
        </button>
      </div>

      <div
        ref={areaRef}
        className="relative flex-1 overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(e) => applyZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08))}
        onDoubleClick={() => applyZoom(zoom > 1.5 ? 1 : 2)}
      >
        {error ? (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white px-6 text-center">{error}</p>
        ) : img && frame.w ? (
          <>
            <img
              src={img.src}
              alt=""
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
              style={{
                width: img.naturalWidth * s,
                height: img.naturalHeight * s,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
            {/* Dimmed surround with a clear frame (huge box-shadow trick). */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-2 border-white/90"
              style={{
                width: frame.w,
                height: frame.h,
                borderRadius: circle ? '50%' : 8,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.62)',
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}
      </div>

      <div className="px-4 pt-2 pb-5 space-y-2 text-white/80">
        <p className="text-xs text-center">টেনে সরান, জুম করে সাইজ ঠিক করুন</p>
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button onClick={() => applyZoom(zoom - 0.25)} className="p-1.5 rounded-full hover:bg-white/10" title="ছোট করুন">
            <ZoomOut className="w-5 h-5" />
          </button>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => applyZoom(Number(e.target.value))}
            className="flex-1 accent-[#EDD6A9]"
          />
          <button onClick={() => applyZoom(zoom + 0.25)} className="p-1.5 rounded-full hover:bg-white/10" title="বড় করুন">
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg hover:bg-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" /> রিসেট
          </button>
        </div>
      </div>
    </div>
  );
};
