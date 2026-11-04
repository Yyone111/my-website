import { useEffect, useRef } from "react";

/**
 * 全站轻柔飘雪背景
 * - 纯 Canvas 实现，零依赖，尊重 prefers-reduced-motion
 * - 雪花自上而下缓慢飘落，带左右摇摆与自转，随深度有近大远小
 * - 颜色浅而柔，不会喧宾夺主；pointer-events 交由 CSS 置 none
 */
export default function Snowfall({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let flakes = [];
    let rafId = 0;

    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const COUNT_DESKTOP = 72;
    const COUNT_MOBILE = 40;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = width < 640 ? COUNT_MOBILE : COUNT_DESKTOP;
      flakes = Array.from({ length: count }, () => makeFlake(true));
    };

    // 深度分布偏向近景：50% 中景，30% 近景大雪花，20% 远景小点
    const makeFlake = (initial) => {
      const roll = Math.random();
      const depth =
        roll < 0.3
          ? 0.9 + Math.random() * 0.2
          : roll < 0.8
            ? 0.55 + Math.random() * 0.3
            : 0.35 + Math.random() * 0.15;
      return {
        x: Math.random() * (width + 80) - 40,
        y: initial ? Math.random() * height : -20 - Math.random() * 40,
        r: (1.9 + Math.random() * 3.1) * depth,
        vy: (0.35 + Math.random() * 0.55) * depth,
        amp: 12 + Math.random() * 24, // 左右摇摆幅度
        speed: 0.004 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        rot: Math.random() * Math.PI * 2,
        alpha: 0.45 + Math.random() * 0.5,
      };
    };

    // 画一片六角树枝状雪花：
    // - 中心亮点
    // - 6 条主臂
    // - 每条主臂上 2~3 对侧向分叉（真正的雪花 dendrite 结构）
    const drawSnowflake = (x, y, size, rot, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;

      // 淡蓝柔背景让浅色主题下可见（替代昂贵的 shadowBlur）
      ctx.fillStyle = "rgba(130, 175, 235, 0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 中心圆点
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
      ctx.fill();

      // 小雪花：简化为六角星
      if (size < 2.7) {
        ctx.lineWidth = size * 0.42;
        for (let k = 0; k < 6; k += 1) {
          const a = (k * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      // 中大雪花：六臂 + 侧向分叉
      ctx.lineWidth = size * 0.3;
      for (let k = 0; k < 6; k += 1) {
        const a = (k * Math.PI) / 3;
        // 主臂
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        ctx.stroke();

        // 侧枝分叉（两对）：分叉点距离、长度随远离中心递减
        const branches = [0.42, 0.68];
        for (let t = 0; t < branches.length; t += 1) {
          const along = branches[t];
          const px = Math.cos(a) * size * along;
          const py = Math.sin(a) * size * along;
          const len = size * 0.34 * (1 - along + 0.35);
          const offA = a + 0.42;
          const offB = a - 0.42;
          for (const off of [offA, offB]) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + Math.cos(off) * len, py + Math.sin(off) * len);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i += 1) {
        const f = flakes[i];
        f.phase += f.speed;
        f.rot += f.spin;
        f.y += f.vy;
        f.x += Math.sin(f.phase) * 0.6;

        if (f.y > height + 20) {
          flakes[i] = makeFlake(false);
          continue;
        }
        if (f.x < -40) f.x = width + 40;
        if (f.x > width + 40) f.x = -40;

        drawSnowflake(f.x, f.y, f.r, f.rot, f.alpha);
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };

    resize();
    if (isReduced) {
      // 只画一帧静态雪花散点
      draw(0);
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(draw);
    }

    const onVisibility = () => {
      cancelAnimationFrame(rafId);
      if (!document.hidden && !isReduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`snowfall-canvas ${className}`}
      aria-hidden="true"
    />
  );
}
