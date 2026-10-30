import { useEffect, useRef } from "react";

/**
 * 轻量粒子星空背景（类星座连线效果）
 * - 纯 Canvas 实现，零依赖，尊重 prefers-reduced-motion
 * - 粒子缓慢漂移 + 近距连线，跟随鼠标轻微扰动
 * - 颜色通过 CSS 变量 --particle-rgb / --particle-alpha 控制，随暗色主题切换
 */
export default function ParticleField({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles = [];
    let rafId = 0;
    let colorTimer = 0;
    const mouse = { x: -9999, y: -9999 };
    let color = { rgb: "74, 124, 255", alpha: 0.42 };

    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DENSITY = 16000; // px² per particle
    const LINK_DIST = 130;

    const readParticleColor = () => {
      const style = window.getComputedStyle(document.documentElement);
      const rgb = style.getPropertyValue("--particle-rgb").trim() || "74, 124, 255";
      const alpha = parseFloat(
        style.getPropertyValue("--particle-alpha").trim(),
      );
      return { rgb, alpha: Number.isFinite(alpha) ? alpha : 0.42 };
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(
        110,
        Math.max(34, Math.floor((width * height) / DENSITY)),
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);
      const { rgb, alpha } = color;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // 鼠标轻扰动（减速弹簧）
        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm > 0 && dm < 170) {
          p.x -= (dxm / dm) * 0.35;
          p.y -= (dym / dm) * 0.35;
        }

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const twinkle = 0.22 + 0.14 * Math.sin(time * 0.001 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${twinkle})`;
        ctx.fill();
      }

      // 连线
      ctx.strokeStyle = `rgba(${rgb}, ${alpha * 0.5})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.globalAlpha = (1 - dist / LINK_DIST) * alpha;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    color = readParticleColor();
    // 主题切换时（dark-mode 类被加到 body 上）轮询更新颜色
    colorTimer = window.setInterval(() => {
      color = readParticleColor();
    }, 1200);

    if (isReduced) {
      // 只画一帧静态粒子，不启动动画循环
      draw(0);
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handleMouseMove, { passive: true });
    window.addEventListener("pointerleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(colorTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-field ${className}`}
      aria-hidden="true"
    />
  );
}