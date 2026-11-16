import { useEffect, useRef } from "react";

const STAR_COUNT = 130;
const BURST_COUNT = 64;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * 首页指尖星空：可交互 Canvas 画布
 * - 点击：绽放一枚烟花（粒子爆炸 + 发光拖尾 + 重力回落）
 * - 拖拽：沿着轨迹留下一串星尘
 * - 星空底色由 CSS 提供，Canvas 全透明叠加；尊重 prefers-reduced-motion
 */
export default function NightCanvas() {
  const canvasRef = useRef(null);
  const clearRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    const stars = [];
    const particles = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seedStars = () => {
      stars.length = 0;
      const count = reduced ? Math.round(STAR_COUNT * 0.4) : STAR_COUNT;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(0.4, 1.5),
          base: reduced ? rand(0.5, 0.9) : rand(0.28, 0.85),
          speed: rand(0.6, 2.2),
          phase: rand(0, Math.PI * 2),
        });
      }
    };

    const pickHue = () => {
      const roll = Math.random();
      if (roll < 0.55) return rand(205, 235); // 夜空蓝
      if (roll < 0.78) return rand(35, 55); // 金黄
      if (roll < 0.92) return rand(300, 330); // 粉紫
      return rand(130, 165); // 青绿
    };

    const burst = (px, py) => {
      const hue = pickHue();
      const n = reduced ? Math.round(BURST_COUNT * 0.5) : BURST_COUNT;
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n + rand(-0.08, 0.08);
        const speed = rand(1.2, 4.6);
        particles.push({
          kind: "spark",
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: rand(0.012, 0.026),
          hue: hue + rand(-14, 14),
          size: rand(1.0, 2.2),
        });
      }
    };

    const streak = (px, py, dx, dy) => {
      const dist = Math.hypot(dx, dy);
      const n = dist > 26 ? 5 : 2;
      for (let i = 0; i < n; i++) {
        const angle = Math.atan2(dy, dx) + rand(-0.9, 0.9);
        const sp = rand(0.4, 2.0);
        particles.push({
          kind: "star",
          x: px + rand(-2, 2),
          y: py + rand(-2, 2),
          vx: Math.cos(angle) * sp,
          vy: Math.sin(angle) * sp,
          life: 1,
          decay: rand(0.03, 0.06),
          hue: rand(205, 235),
          size: rand(0.9, 1.9),
        });
      }
    };

    const glow = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(r, 0.1));
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(r, 0.001), 0, Math.PI * 2);
      ctx.fill();
    };

    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min((now - last) / 16.7, 3);
      last = now;

      ctx.clearRect(0, 0, width, height);

      // 静态星空（受控闪烁）
      const t = now / 1000;
      for (const s of stars) {
        const tw = reduced ? 0 : Math.sin(t * s.speed + s.phase) * 0.35;
        ctx.globalAlpha = Math.min(1, Math.max(0, s.base + tw));
        ctx.fillStyle = "#cfe2ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 粒子：发光叠加
      ctx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= p.decay * dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        if (p.kind === "spark") {
          p.vy += 0.05 * dt;
          p.vx *= 0.985;
          p.vy *= 0.985;
        }
        p.x += p.vx * dt * 0.7;
        p.y += p.vy * dt * 0.7;

        const fade = Math.max(p.life, 0);
        glow(
          p.x,
          p.y,
          p.size * (2.2 + p.life * 2.4),
          `hsla(${p.hue}, 100%, 66%, ${0.85 * fade})`,
        );
        ctx.fillStyle = `hsla(${p.hue}, 100%, 88%, ${fade})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // 粒子数量保护，防止长期拖拽导致性能劣化
      if (particles.length > 1400) {
        particles.splice(0, particles.length - 1400);
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    seedStars();
    raf = requestAnimationFrame(frame);

    clearRef.current = () => {
      particles.length = 0;
    };

    const brush = {};
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e) => {
      const { x, y } = getPos(e);
      burst(x, y);
      brush.active = true;
      brush.px = x;
      brush.py = y;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 个别环境不支持捕获时忽略 */
      }
    };

    const onPointerMove = (e) => {
      if (!brush.active) return;
      const { x, y } = getPos(e);
      const dx = x - brush.px;
      const dy = y - brush.py;
      if (Math.hypot(dx, dy) > 8) {
        streak(x, y, dx, dy);
        brush.px = x;
        brush.py = y;
      }
    };

    const onPointerEnd = () => {
      brush.active = false;
    };

    const handleResize = () => {
      resize();
      seedStars();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerEnd);
    canvas.addEventListener("pointerleave", onPointerEnd);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      clearRef.current = null;
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerEnd);
      canvas.removeEventListener("pointerleave", onPointerEnd);
    };
  }, []);

  return (
    <section className="night-canvas reveal" style={{ "--i": 3 }}>
      <header className="night-canvas-head">
        <h3 className="night-canvas-title">指尖星空</h3>
        <p className="night-canvas-sub">
          点一下，炸开一朵烟花；按住拖曳，留下一串星尘。
        </p>
      </header>
      <div className="night-canvas-stage">
        <canvas
          ref={canvasRef}
          className="night-canvas-board"
          role="img"
          aria-label="互动夜空：点击绽放烟花，拖拽留下星轨"
        />
        <p className="night-canvas-hint" aria-hidden="true">
          点击 / 拖拽
        </p>
        <button
          type="button"
          className="night-canvas-clear"
          onClick={() => clearRef.current?.()}
        >
          清空夜空
        </button>
      </div>
    </section>
  );
}