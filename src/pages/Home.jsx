import { useEffect, useState } from "react";
import UiIcon from "../components/UiIcon";
import PhotoWall from "../components/PhotoWall";
import { HERO_SLOGANS, STATS } from "../data";

export default function Home({ onNavigate }) {
  const [typedText, setTypedText] = useState("");
  const [sloganIndex, setSloganIndex] = useState(0);

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
        <h1 className="hero-landing-title" aria-label="Hello, I'm Yy">
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
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="photo-wall-section reveal" style={{ "--i": 2 }}>
        <header className="photo-wall-head">
          <h3 className="photo-wall-title">时光相册</h3>
          <p className="photo-wall-sub">走过的路与看过的风景，滚动浏览。</p>
        </header>
        <PhotoWall />
      </section>
    </div>
  );
}
