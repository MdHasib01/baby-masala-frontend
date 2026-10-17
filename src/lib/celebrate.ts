// Confetti burst + a short message, drawn on a temporary full-screen canvas.
// Used after publishing a post (same effect as mobile/lib/shared/widgets/celebration.dart).

const COLORS = ['#56020A', '#D6AA4F', '#EDD6A9', '#375013', '#E11D48', '#2563EB'];
const DURATION = 2400;

export function celebrate(message = 'পোস্ট সফল হয়েছে! 🎉') {
  if (typeof window === 'undefined') return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const root = document.createElement('div');
  root.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  const badge = document.createElement('div');
  badge.textContent = message;
  badge.style.cssText =
    'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.4);opacity:0;' +
    'background:#fff;color:#56020A;font-weight:700;font-size:16px;padding:14px 22px;border-radius:24px;' +
    'box-shadow:0 10px 30px rgba(0,0,0,.18);transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .3s;';
  root.append(canvas, badge);
  document.body.appendChild(root);

  requestAnimationFrame(() => {
    badge.style.opacity = '1';
    badge.style.transform = 'translate(-50%,-50%) scale(1)';
  });
  window.setTimeout(() => (badge.style.opacity = '0'), DURATION - 500);

  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // Two cannons from the lower corners, aimed up and inward.
  const pieces = reduced
    ? []
    : Array.from({ length: 110 }, (_, i) => {
        const left = i % 2 === 0;
        const angle = (left ? -Math.PI / 3 : (-2 * Math.PI) / 3) + (Math.random() - 0.5) * 0.9;
        const speed = 0.9 + Math.random() * 0.8;
        return {
          left,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          spin: (Math.random() - 0.5) * 14,
          size: 5 + Math.random() * 6,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          circle: Math.random() < 0.3,
          delay: Math.random() * 0.12,
        };
      });

  const start = performance.now();
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION);
    ctx.clearRect(0, 0, w, h);
    for (const p of pieces) {
      const lt = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay)));
      if (lt === 0) continue;
      const x = (p.left ? 0 : w) + p.vx * lt * h * 0.9;
      const y = h + (p.vy * lt + 1.6 * lt * lt) * h * 0.9;
      ctx.globalAlpha = Math.max(0, 1 - lt * lt);
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.spin * lt);
      if (p.circle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    if (t < 1) requestAnimationFrame(frame);
    else root.remove();
  };
  requestAnimationFrame(frame);
}
