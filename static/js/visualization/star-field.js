/**
 * JyotishVeda — canvas star field for the hero section.
 * Static points with gentle twinkling; disabled when the visitor has asked
 * for reduced motion.
 */
export function renderStarField(canvas) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [];
  let raf = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(220, Math.round((w * h) / 7000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
    }));
  }

  function draw(t) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const alpha = reduce ? 0.6 : 0.35 + 0.45 * Math.abs(Math.sin(t / 1400 * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 228, 181, ${alpha})`;
      ctx.fill();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", () => {
    if (raf) cancelAnimationFrame(raf);
    resize();
    draw(0);
    if (!reduce) raf = requestAnimationFrame(draw);
  });
  draw(0);
}

