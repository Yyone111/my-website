import { useMemo, useState } from "react";
import UiIcon from "../components/UiIcon";
import { PROJECTS } from "../data";

const ALL = "全部";

export default function Projects() {
  const [active, setActive] = useState(ALL);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(PROJECTS.map((p) => p.category)))],
    [],
  );

  const list = useMemo(
    () =>
      active === ALL
        ? PROJECTS
        : PROJECTS.filter((project) => project.category === active),
    [active],
  );

  return (
    <div className="page-shell">
      <header className="page-head reveal" style={{ "--i": 0 }}>
        <p className="page-head-kicker">01 — PROJECTS</p>
        <h2 className="page-head-title">精选作品</h2>
        <p className="page-head-desc">
          从个人站点到小工具，每个项目都解决过真实问题。按类型筛选，看看不同方向的实践。
        </p>
      </header>

      <div className="filter-bar reveal" style={{ "--i": 1 }}>
        <span className="filter-bar-icon">
          <UiIcon name="filter" />
        </span>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-chip ${active === category ? "is-active" : ""}`}
            onClick={() => setActive(category)}
          >
            {category}
            <span className="filter-chip-count">
              {category === ALL
                ? PROJECTS.length
                : PROJECTS.filter((p) => p.category === category).length}
            </span>
          </button>
        ))}
      </div>

      <div className="projects-grid projects-page-grid">
        {list.map((project, index) => (
          <article
            key={project.key}
            className="project-card reveal"
            style={{ "--i": index + 2 }}
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
              <span className="project-cover-year">{project.year}</span>
            </div>
            <div className="project-info">
              <div className="project-title-row">
                <h4>{project.title}</h4>
                <span className="project-category">{project.category}</span>
              </div>
              <p>{project.detail}</p>
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {project.href ? (
                <a className="project-link" href={project.href}>
                  了解更多 →
                </a>
              ) : (
                <span className="project-link project-link-muted">
                  持续打磨中
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
