import { useEffect, useRef, useState } from "react";

const STATES = {
  IDLE: "idle",
  BLINK: "blink",
  SLEEPY: "sleepy",
  HAPPY: "happy",
  FOLLOW: "follow",
};

const PIXEL = 4; // 像素放大倍数

/**
 * 像素小猫 SVG（16x16 网格）
 * 通过 CSS transform 放大到合适尺寸
 */
function CatSVG({ state }) {
  const isSleepy = state === STATES.SLEEPY;
  const isBlink = state === STATES.BLINK;
  const isHappy = state === STATES.HAPPY;

  // 16x16 像素网格，每格 1 单位
  const body = "#f4a261"; // 橘猫
  const bodyDark = "#e76f51";
  const white = "#ffffff";
  const black = "#1a1a1a";
  const pink = "#ffb4a2";

  return (
    <svg
      width={64}
      height={64}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* 耳朵 */}
      <rect x="3" y="2" width="2" height="3" fill={body} />
      <rect x="11" y="2" width="2" height="3" fill={body} />
      <rect x="4" y="3" width="1" height="1" fill={pink} />
      <rect x="11" y="3" width="1" height="1" fill={pink} />

      {/* 头 */}
      <rect x="4" y="4" width="8" height="7" fill={body} />
      <rect x="5" y="5" width="6" height="5" fill={white} />

      {/* 眼睛 */}
      {isSleepy ? (
        <>
          <rect x="6" y="7" width="2" height="1" fill={black} />
          <rect x="9" y="7" width="2" height="1" fill={black} />
        </>
      ) : isBlink ? (
        <>
          <rect x="6" y="7" width="2" height="1" fill={black} />
          <rect x="9" y="7" width="2" height="1" fill={black} />
        </>
      ) : (
        <>
          <rect x="6" y="6" width="1" height="2" fill={black} />
          <rect x="9" y="6" width="1" height="2" fill={black} />
          {/* 高光 */}
          <rect x="6" y="6" width="1" height="1" fill={white} />
          <rect x="9" y="6" width="1" height="1" fill={white} />
        </>
      )}

      {/* 鼻子 */}
      <rect x="7" y="8" width="2" height="1" fill={pink} />

      {/* 嘴巴 */}
      {isHappy ? (
        <>
          <rect x="6" y="9" width="1" height="1" fill={black} />
          <rect x="9" y="9" width="1" height="1" fill={black} />
        </>
      ) : (
        <>
          <rect x="7" y="9" width="1" height="1" fill={black} />
          <rect x="8" y="9" width="1" height="1" fill={black} />
        </>
      )}

      {/* 身体 */}
      <rect x="5" y="11" width="6" height="4" fill={body} />
      <rect x="6" y="12" width="4" height="3" fill={white} />

      {/* 尾巴 */}
      <rect x="11" y="12" width="1" height="2" fill={bodyDark} />
      <rect x="12" y="11" width="1" height="2" fill={bodyDark} />

      {/* 爪子 */}
      <rect x="5" y="14" width="2" height="1" fill={bodyDark} />
      <rect x="9" y="14" width="2" height="1" fill={bodyDark} />
    </svg>
  );
}

export default function PixelPet() {
  const [state, setState] = useState(STATES.IDLE);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const petRef = useRef(null);

  // 状态机：随机切换
  useEffect(() => {
    const loop = () => {
      const roll = Math.random();
      if (roll < 0.5) {
        setState(STATES.IDLE);
      } else if (roll < 0.7) {
        setState(STATES.BLINK);
        setTimeout(() => setState(STATES.IDLE), 200);
      } else if (roll < 0.85) {
        setState(STATES.SLEEPY);
        setTimeout(() => setState(STATES.IDLE), 2000);
      } else if (roll < 0.95) {
        setState(STATES.HAPPY);
        setTimeout(() => setState(STATES.IDLE), 1500);
      } else {
        setState(STATES.FOLLOW);
        setTimeout(() => setState(STATES.IDLE), 3000);
      }
    };

    timerRef.current = setInterval(loop, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  // 点击交互
  const handleClick = () => {
    setState(STATES.HAPPY);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setState(STATES.IDLE), 2000);
  };

  // 鼠标跟随（仅在 FOLLOW 状态）
  useEffect(() => {
    if (state !== STATES.FOLLOW) return undefined;

    const onMove = (e) => {
      const pet = petRef.current;
      if (!pet) return;
      const rect = pet.getBoundingClientRect();
      const targetX = e.clientX - rect.width / 2;
      const targetY = e.clientY - rect.height / 2;
      setPos({ x: targetX, y: targetY });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [state]);

  if (!visible) return null;

  return (
    <div
      ref={petRef}
      className={`pixel-pet pixel-pet-${state}`}
      style={{
        left: pos.x || undefined,
        top: pos.y || undefined,
      }}
      onClick={handleClick}
      role="button"
      aria-label="像素小猫宠物"
      tabIndex={0}
    >
      <CatSVG state={state} />
      <button
        type="button"
        className="pixel-pet-close"
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
        aria-label="关闭宠物"
      >
        ×
      </button>
    </div>
  );
}