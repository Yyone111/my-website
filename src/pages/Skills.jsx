import UiIcon from "../components/UiIcon";
import { SKILLS, SKILL_GROUPS, STACK_FOCUS } from "../data";

export default function Skills() {
  return (
    <div className="page-shell">
      <header className="page-head reveal" style={{ "--i": 0 }}>
        <p className="page-head-kicker">02 — SKILLS</p>
        <h2 className="page-head-title">技能与工具</h2>
        <p className="page-head-desc">
          自评百分比只代表熟悉程度，不代表边界。真正决定交付的是能否把需求拆清楚并稳定落地。
        </p>
      </header>

      <section className="function-card reveal" style={{ "--i": 1 }}>
        <header className="card-header">
          <span className="card-icon">
            <UiIcon name="layers" />
          </span>
          <h3 className="card-title">主力技术栈</h3>
        </header>
        <div className="stack-focus-list skills-stack-row">
          {STACK_FOCUS.map((item) => (
            <span key={item} className="stack-focus-tag">
              {item}
            </span>
          ))}
        </div>
        <div className="skills-compact skills-overview">
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
              <p className="skill-chip-note">{skill.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="skill-group-grid">
        {SKILL_GROUPS.map((group, groupIndex) => (
          <section
            className="function-card skill-group-card reveal"
            style={{ "--i": groupIndex + 2 }}
            key={group.title}
          >
            <header className="card-header">
              <span className="card-icon">
                <UiIcon name={group.icon} />
              </span>
              <h3 className="card-title">{group.title}</h3>
            </header>
            <p className="skill-group-desc">{group.desc}</p>
            <ul className="skill-detail-list">
              {group.items.map((item) => (
                <li className="skill-detail-item" key={item.name}>
                  <div className="skill-detail-head">
                    <span className="skill-detail-name">{item.name}</span>
                    <span className="skill-detail-level">{item.level}</span>
                  </div>
                  <div className="skill-detail-bar">
                    <span style={{ width: `${item.level}%` }} />
                  </div>
                  <p className="skill-detail-note">{item.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
