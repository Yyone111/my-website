import UiIcon from "../components/UiIcon";
import { SKILL_GROUPS, STACK_FOCUS } from "../data";

export default function Skills() {
  return (
    <div className="page-shell">
      <header className="page-head reveal" style={{ "--i": 0 }}>
        <p className="page-head-kicker">02 — SKILLS</p>
        <h2 className="page-head-title">技能与工具</h2>
        <p className="page-head-desc">
          自评百分比只代表熟悉程度，不代表边界。真正决定交付的是能否把需求拆清楚并稳定落地。
        </p>
        <div className="stack-focus-list page-head-tags">
          {STACK_FOCUS.map((item) => (
            <span key={item} className="stack-focus-tag">
              {item}
            </span>
          ))}
        </div>
      </header>

      <div className="skill-group-grid">
        {SKILL_GROUPS.map((group, groupIndex) => (
          <section
            className="function-card skill-group-card reveal"
            style={{ "--i": groupIndex + 1 }}
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

      <section className="function-card reveal" style={{ "--i": 4 }}>
        <header className="card-header">
          <span className="card-icon">
            <UiIcon name="idea" />
          </span>
          <h3 className="card-title">怎么理解这些数字</h3>
        </header>
        <div className="skill-legend">
          <div className="skill-legend-item">
            <strong>70 - 79</strong>
            <span>能独立完成常见需求，遇到边界问题需要查证。</span>
          </div>
          <div className="skill-legend-item">
            <strong>80 - 89</strong>
            <span>熟悉生态与最佳实践，能给出方案并解释取舍。</span>
          </div>
          <div className="skill-legend-item">
            <strong>90 +</strong>
            <span>能处理疑难问题，也能把经验沉淀成规范。</span>
          </div>
        </div>
      </section>
    </div>
  );
}
