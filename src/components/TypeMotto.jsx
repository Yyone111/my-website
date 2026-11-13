import { useEffect, useRef, useState } from "react";
import { MOTTOES } from "../data";

/**
 * 动态打字格言（升级版动画）
 * - 逐字打出：每个字符入场时 scale+上浮+去模糊+淡入，带轻微随机节奏
 * - 整句打完后触发「荧光点亮」扫过全句，随后停留再逐字消隐
 * - 英文行滑入淡入；卡片带一层缓慢漂移的极光光晕
 * - 尊重 prefers-reduced-motion：直接显示整句并按时切换，不做动画
 */

const TYPE_MS = 105; // 每字输入间隔
const DELETE_MS = 40; // 每字删除间隔
const HOLD_MS = 3200; // 整句停留时间

export default function TypeMotto() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * MOTTOES.length),
  );
  const [count, setCount] = useState(0); // 当前打出的字符数
  const [phase, setPhase] = useState("typing"); // typing | holding | deleting

  const modeRef = useRef("typing");

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setCount(MOTTOES[index].zh.length);
      setPhase("holding");
      const timer = setTimeout(() => {
        setIndex((i) => (i + 1) % MOTTOES.length);
        setCount(0);
        modeRef.current = "typing";
      }, HOLD_MS + 400);
      return () => clearTimeout(timer);
    }

    const text = MOTTOES[index].zh;

    if (modeRef.current === "typing") {
      if (count < text.length) {
        const timer = setTimeout(() => setCount((c) => c + 1), TYPE_MS);
        return () => clearTimeout(timer);
      }
      setPhase("holding");
      modeRef.current = "holding";
      return undefined;
    }

    if (modeRef.current === "holding") {
      const timer = setTimeout(() => {
        modeRef.current = "deleting";
        setPhase("deleting");
      }, HOLD_MS);
      return () => clearTimeout(timer);
    }

    // deleting
    if (count > 0) {
      const timer = setTimeout(() => setCount((c) => c - 1), DELETE_MS);
      return () => clearTimeout(timer);
    }
    modeRef.current = "typing";
    setPhase("typing");
    setIndex((i) => (i + 1) % MOTTOES.length);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, index, phase]);

  useEffect(() => {
    modeRef.current = "typing";
    setPhase("typing");
  }, [index]);

  const current = MOTTOES[index];
  const shown = current.zh.slice(0, count);
  const chars = shown.split("");

  return (
    <section className="motto-section reveal" style={{ "--i": 2 }}>
      <div className="motto-card">
        <span className="motto-aura" aria-hidden="true" />
        <span className="motto-noise" aria-hidden="true" />
        <div className="motto-inner" aria-live="polite">
          <p className="motto-kicker">DAILY MOTTO · 今日格言</p>
          <p className={`motto-zh ${phase === "holding" ? "is-full" : ""}`}>
            {chars.map((ch, i) => (
              <span
                key={`${index}-${i}`}
                className="motto-char"
                style={{ "--char-i": i }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
            <span className="motto-caret" aria-hidden="true" />
          </p>
          <p className="motto-en">{current.en}</p>
          <p className="motto-index">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(MOTTOES.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
