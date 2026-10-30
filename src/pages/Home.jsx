import { useEffect, useState } from "react";
import UiIcon from "../components/UiIcon";
import useTiltCards from "../hooks/useTiltCards";
import { HERO_SLOGANS, PROJECTS, SKILLS, STATS, TIMELINE } from "../data";

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduced) {
      setValue(target);
      return () => {};
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function SkillChip({ skill }) {
  const progress = useCountUp(skill.level);
  return (
    <div className="skill-chip">
      <div className="skill-chip-head">
        <span className="skill-chip-name">{skill.name}</span>
        <span className="skill-chip-level">{progress}%</span>
      </div>
      <div className="skill-bar">
        <div
          className="skill-progress"
          style={{ width: `${skill.level}%`, "--progress": `${skill.level}%` }}
        />
      </div>
    </div>
  );
}

export default function Home({ onNavigate }) {
  const [typedText, setTypedText] = useState("");
  const [sloganIndex, setSloganIndex] = useState(0);
  const projectsRef = useTiltCards(true);

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

      <section className="content-pair">
        <section
          className="function-card about-card reveal"
          style={{ "--i": 1 }}
        >
          <header className="card-header">
            <span className="card-icon">
              <UiIcon name="idea" />
            </span>
            <h3 className="card-title">关于我</h3>
          </header>
          <div className="card-content">
            <p className="about-lead">
              全能型全栈开发者，专注 React / Vue 前端与 Node.js
              后端，喜欢把复杂交互做得简单好用。
            </p>
            <div className="about-metrics">
              <div className="about-metric">
                <strong>3+</strong>
                <span>年开发经验</span>
              </div>
              <div className="about-metric">
                <strong>10+</strong>
                <span>完成项目</span>
              </div>
              <div className="about-metric">
                <strong>6</strong>
                <span>主力技术栈</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="function-card skills-card reveal"
          style={{ "--i": 2 }}
        >
          <header className="card-header">
            <span className="card-icon">
              <UiIcon name="code" />
            </span>
            <h3 className="card-title">技能</h3>
            <button
              type="button"
              className="card-more"
              onClick={() => onNavigate("skills")}
            >
              全部技能 <UiIcon name="arrow" className="card-more-icon" />
            </button>
          </header>
          <div className="skills-compact">
            {SKILLS.map((skill) => (
              <SkillChip key={skill.name} skill={skill} />
            ))}
          </div>
        </section>
      </section>

      <section
        className="function-card projects-section reveal"
        style={{ "--i": 3 }}
      >
        <header className="card-header">
          <span className="card-icon">
            <UiIcon name="chart" />
          </span>
          <h3 className="card-title">精选作品</h3>
          <button
            type="button"
            className="card-more"
            onClick={() => onNavigate("projects")}
          >
            全部作品 <UiIcon name="arrow" className="card-more-icon" />
          </button>
        </header>
        <div className="projects-grid" ref={projectsRef}>
          {PROJECTS.slice(0, 3).map((project) => (
            <a
              key={project.key}
              className="project-card tilt-card"
              href={project.href || "#/projects"}
              aria-label={project.title}
            >
              <div
                className="project-image"
                role="presentation"
                style={{ background: project.tone, "--tone": project.tone }}
              >
                <span className="project-cover-icon">
                  <UiIcon name={project.icon} />
                </span>
                <span className="project-cover-meta">{project.meta}</span>
              </div>
              <div className="project-info">
                <h4>{project.title}</h4>
                <p>{project.desc}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <span className="project-link">了解更多 →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section
        className="function-card timeline-card reveal"
        style={{ "--i": 4 }}
      >
        <header className="card-header">
          <span className="card-icon">
            <UiIcon name="idea" />
          </span>
          <h3 className="card-title">成长足迹</h3>
          <button
            type="button"
            className="card-more"
            onClick={() => onNavigate("about")}
          >
            完整时间线 <UiIcon name="arrow" className="card-more-icon" />
          </button>
        </header>
        <div className="timeline-grid">
          {TIMELINE.map((item) => (
            <div className="timeline-row" key={item.period}>
              <p className="timeline-period">{item.period}</p>
              <p className="timeline-text">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
