import { useEffect, useRef, useState } from "react";
import UiIcon from "../components/UiIcon";
import TypeMotto from "../components/TypeMotto";
import Terminal from "../components/Terminal";
import NowCard from "../components/NowCard";
import { HERO_SLOGANS, STATS } from "../data";

// 统计数值滚动：进入视口时从 0 递增到目标值，"∞" 等非数字原样输出
function CountUp({ value }) {
  const match = String(value).match(/^(\d+)(.*)$/);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";
  const ref = useRef(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === null) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      setCurrent(target);
      return undefined;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1100;
        const tick = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCurrent(Math.round(target * eased));
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  if (target === null) {
    return <p className="stat-value">{value}</p>;
  }

  return (
    <p className="stat-value" ref={ref}>
      {current}
      {suffix}
    </p>
  );
}

export default function Home({ onNavigate }) {
  const [typedText, setTypedText] = useState("");
  const [sloganIndex, setSloganIndex] = useState(0);
  const titleRef = useRef(null);

  // 标题 3D 视差：跟随鼠标倾斜，缓动收敛；减少动效时不启用
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return undefined;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return undefined;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const loop = () => {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      el.style.setProperty("--tilt-x", `${curX.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${curY.toFixed(2)}deg`);

      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const halfW = Math.max(1, window.innerWidth / 2);
      const halfH = Math.max(1, window.innerHeight / 2);
      const dx = (event.clientX - (rect.left + rect.width / 2)) / halfW;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / halfH;
      targetY = Math.max(-1, Math.min(1, dx)) * 4.5;
      targetX = Math.max(-1, Math.min(1, dy)) * -3.5;
      wake();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // 打字机副标题：克制轮换，尊重 prefers-reduced-motion
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const current = HERO_SLOGANS[sloganIndex];

    if (prefersReduced) {
      setTypedText(current.text);
      const timer = setTimeout(
        () => setSloganIndex((i) => (i + 1) % HERO_SLOGANS.length),
        4200,
      );
      return () => clearTimeout(timer);
    }

    setTypedText("");
    let charIndex = 0;
    let holdTimer = null;
    const typeTimer = setInterval(() => {
      charIndex += 1;
      setTypedText(current.text.slice(0, charIndex));
      if (charIndex >= current.text.length) {
        clearInterval(typeTimer);
        holdTimer = setTimeout(
          () => setSloganIndex((i) => (i + 1) % HERO_SLOGANS.length),
          2400,
        );
      }
    }, 110);

    return () => {
      clearInterval(typeTimer);
      if (holdTimer) clearTimeout(holdTimer);
    };
  }, [sloganIndex]);

  return (
    <div className="page-shell">
      <section className="hero-landing reveal" style={{ "--i": 0 }}>
        <p className="hero-kicker">
          <span className="hero-kicker-dot" />
          全栈开发者 · 个人主页
        </p>
        <h1
          className="hero-landing-title"
          ref={titleRef}
          aria-label="Hello, I'm Yy"
        >
          {"Hello, I'm ".split("").map((char, index) => (
            <span
              key={`pre-${index}`}
              className="title-char"
              style={{ "--char-i": index }}
              aria-hidden="true"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
          <span className="gradientText title-char" style={{ "--char-i": 10 }}>
            Y
          </span>
          <span className="title-char" style={{ "--char-i": 11 }}>
            y
          </span>
        </h1>
        <p className="hero-landing-subtitle typewriter-line">
          <span className={HERO_SLOGANS[sloganIndex].accent}>{typedText}</span>
          <span className="typewriter-caret" aria-hidden="true" />
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="hero-btn"
            onClick={() => onNavigate("projects")}
          >
            <UiIcon name="rocket" className="hero-btn-icon" /> 查看作品
          </button>
          <button
            type="button"
            className="hero-btn hero-btn-secondary"
            onClick={() => onNavigate("about")}
          >
            <UiIcon name="pin" className="hero-btn-icon" /> 我的足迹
          </button>
        </div>
        <div className="stats-grid hero-stats">
          {STATS.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <CountUp value={stat.value} />
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="motto-anchor reveal" style={{ "--i": 2 }}>
        <TypeMotto />
        <NowCard />
      </section>

      <Terminal />
    </div>
  );
}
