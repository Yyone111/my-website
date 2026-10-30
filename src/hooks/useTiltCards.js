import { useEffect, useRef } from "react";

/**
 * 项目卡片 3D 视差 hook（类 Holo Card 效果）
 * - 通过事件委托监听卡片容器的 pointermove，为子卡片写入 --rx/--ry 位移
 * - 尊重 prefers-reduced-motion：命中后直接 return，不监听任何事件
 * - 返回 ref 应挂在卡片容器（projects-grid）上
 */
export default function useTiltCards(active = true) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return undefined;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    let rafId = 0;
    const MAX_TILT = 7; // 最大倾角（度）
    const cards = [];

    const collect = () => {
      cards.length = 0;
      container.querySelectorAll(".project-card").forEach((card) => {
        cards.push({ el: card, rect: card.getBoundingClientRect() });
      });
    };

    const handleMove = (event) => {
      cancelAnimationFrame(rafId);
      const x = event.clientX;
      const y = event.clientY;
      rafId = requestAnimationFrame(() => {
        cards.forEach((entry) => {
          const rect = entry.rect;
          if (
            x < rect.left - 40 ||
            x > rect.right + 40 ||
            y < rect.top - 40 ||
            y > rect.bottom + 40
          ) {
            entry.el.style.setProperty("--rx", "0deg");
            entry.el.style.setProperty("--ry", "0deg");
            return;
          }
          const dx = (x - rect.left) / rect.width - 0.5;
          const dy = (y - rect.top) / rect.height - 0.5;
          entry.el.style.setProperty("--rx", `${(-dy * MAX_TILT).toFixed(2)}deg`);
          entry.el.style.setProperty("--ry", `${(dx * MAX_TILT).toFixed(2)}deg`);
        });
      });
    };

    const handleLeave = () => {
      cancelAnimationFrame(rafId);
      cards.forEach((entry) => {
        entry.el.style.setProperty("--rx", "0deg");
        entry.el.style.setProperty("--ry", "0deg");
      });
    };

    const handleResize = () => collect();

    // 卡片是路由切换后渲染的，稍等一帧保证 rect 可用
    const initTimer = window.setTimeout(collect, 60);
    container.addEventListener("pointermove", handleMove);
    container.addEventListener("pointerleave", handleLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(initTimer);
      cancelAnimationFrame(rafId);
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [active]);

  return containerRef;
}