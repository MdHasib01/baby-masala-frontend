// Browser-side photo helpers. Photos go to the API as JPEG data URLs; the
// backend uploads them to Cloudinary and stores only the link.

/** Backend accepts media fields up to 2,000,000 chars. */
const MAX_DATA_URL = 1_900_000;

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('ছবিটি খোলা যাচ্ছে না। অন্য একটি ছবি নির্বাচন করুন।'));
    img.src = src;
  });

/** Draws `src` (a region of `img`) at outW × outH and returns a JPEG data URL under the size limit. */
export function renderToDataUrl(
  img: CanvasImageSource,
  src: { x: number; y: number; w: number; h: number },
  outW: number,
  outH: number
): string {
  for (const [scale, quality] of [
    [1, 0.85],
    [1, 0.7],
    [0.75, 0.65],
    [0.5, 0.6],
  ] as const) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(outW * scale));
    canvas.height = Math.max(1, Math.round(outH * scale));
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, src.x, src.y, src.w, src.h, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/jpeg', quality);
    if (url.length <= MAX_DATA_URL) return url;
  }
  throw new Error('ছবিটি অনেক বড়। অন্য একটি ছবি নির্বাচন করুন।');
}

/** File from an <input type="file"> → JPEG data URL, longest side ≤ maxSide. */
export async function fileToDataUrl(file: File, maxSide = 1280): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('শুধু ছবি (JPG/PNG) নির্বাচন করুন।');
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    return renderToDataUrl(
      img,
      { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight },
      img.naturalWidth * scale,
      img.naturalHeight * scale
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
