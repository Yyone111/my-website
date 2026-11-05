import { useEffect, useRef, useState } from "react";
import UiIcon from "./UiIcon";
import { GALLERY } from "../data";

/**
 * 晾衣绳照片墙
 * - 一条绳子横拉过去，照片用木夹子一张张挂在绳上
 * - 滚动到视口时，照片从绳子上方转下来「挂上去」：位移 + 旋转 + 去模糊 + 淡入
 * - 相邻照片挂在绳上带不同静止倾角（--tilt），避免排得像表格
 * - 尊重 prefers-reduced-motion：直接显示，不做入场动画
 */

// 每张照片挂在绳上的静止倾角（deg），循环使用制造自然错落
const TILTS = [
  "0deg",
  "-2.2deg",
  "1.6deg",
  "-1.2deg",
  "2.4deg",
  "-1.8deg",
  "0.8deg",
  "-2.6deg",
];

export default function PhotoWall() {
  const lineRef = useRef(null);
  const [hungIds, setHungIds] = useState(() => new Set());

  useEffect(() => {
    const root = lineRef.current;
    if (!root) return undefined;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setHungIds(new Set(GALLERY.map((item) => item.id)));
      return undefined;
    }

    const items = root.querySelectorAll(".line-photo");
    const hung = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        const batch = entries.filter((entry) => entry.isIntersecting);
        if (!batch.length) return;
        let changed = false;
        // 同批进入的照片依次错峰挂上
        batch.forEach((entry, index) => {
          const id = Number(entry.target.dataset.id);
          if (hung.has(id)) return;
          entry.target.style.transitionDelay = `${index * 110}ms`;
          hung.add(id);
          changed = true;
        });
        if (changed) setHungIds(new Set(hung));
      },
      { threshold: 0.15, rootMargin: "0px 0px -12% 0px" },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="photo-line" ref={lineRef}>
      {/* 绳子的圆柱感靠这条竖向渐变做出光泽（全局共用一个 defs） */}
      <svg className="line-rope-defs" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="lineRopeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="line-rope-c0" />
            <stop offset="0.55" className="line-rope-c1" />
            <stop offset="1" className="line-rope-c2" />
          </linearGradient>
        </defs>
      </svg>

      <div className="line-track">
        {GALLERY.map((item, index) => (
          <figure
            key={item.id}
            className={`line-photo ${hungIds.has(item.id) ? "is-hung" : ""}`}
            data-id={item.id}
            style={{ "--tilt": TILTS[index % TILTS.length] }}
          >
            {/* 绳段：以每张照片为一段，夹子处最高、照片之间下垂，多段接成一条带弧度的绳 */}
            <svg
              className="line-rope"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                className="line-rope-path"
                d="M0,100 Q50,-100 100,100"
                stroke="url(#lineRopeGradient)"
              />
            </svg>

            <span className="line-peg" aria-hidden="true" />

            <div className="line-frame">
              <div
                className="line-shot"
                style={{ "--tone-a": item.tone[0], "--tone-b": item.tone[1] }}
              >
                {item.src ? (
                  <img src={item.src} alt={item.caption} loading="lazy" />
                ) : (
                  <span className="line-hold" aria-hidden="true">
                    <UiIcon name="camera" className="line-hold-icon" />
                  </span>
                )}
              </div>

              <figcaption className="line-meta">
                <span className="line-caption">{item.caption}</span>
                <span className="line-year">{item.year}</span>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
