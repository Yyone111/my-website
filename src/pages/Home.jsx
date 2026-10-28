import { useEffect, useState } from "react";
import UiIcon from "../components/UiIcon";
import { HERO_SLOGANS, PROJECTS, SKILLS, STATS, TIMELINE } from "../data";

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
        <h1 className="hero-landing-title">
          Hello, I'm <span className="gradientText">Yy</span>
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
            <div className="about-facts">
              <span>
                <UiIcon name="pin" /> ALLWORLD · Iceland
              </span>
              <span>
                <UiIcon name="email" /> yangyao596@gmail.com
              </span>
              <span>
                <UiIcon name="clock" /> 工作日 10:00 - 22:00
              </span>
            </div>
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
              <div className="skill-chip" key={skill.name}>
                <div className="skill-chip-head">
                  <span className="skill-chip-name">{skill.name}</span>
                  <span className="skill-chip-level">{skill.level}%</span>
                </div>
                <div className="skill-bar">
                  <div
                    className="skill-progress"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
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
        <div className="projects-grid">
          {PROJECTS.slice(0, 3).map((project) => (
            <a
              key={project.key}
              className="project-card"
              href={project.href || "#/projects"}
              aria-label={project.title}
            >
              <div
                className="project-image"
                role="presentation"
                style={{ background: project.tone }}
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
