import UiIcon from "./UiIcon";
import { PROJECTS } from "../data";

/**
 * 首页精选作品
 * - 取 PROJECTS 前三项做成卡片，点击跳转作品页
 * - 毛玻璃 + 主题色点缀，风格与首页格言卡一致
 */

const PICK = PROJECTS.slice(0, 3);

export default function HomeProjects({ onNavigate }) {
  return (
    <section className="hp-projects reveal" style={{ "--i": 3 }}>
      <header className="hp-projects-head">
        <h3 className="hp-projects-title">精选作品</h3>
        <p className="hp-projects-sub">下面挑三件拿出来看看，更多在作品页。</p>
      </header>

      <div className="hp-projects-grid">
        {PICK.map((item) => (
          <button
            key={item.key}
            type="button"
            className="hp-project-card"
            style={{ "--ptone": item.tone }}
            onClick={() => onNavigate("projects")}
          >
            <div className="hp-project-top">
              <span className="hp-project-icon" aria-hidden="true">
                <UiIcon name={item.icon} />
              </span>
              <span className="hp-project-meta">{item.meta}</span>
            </div>
            <h4 className="hp-project-name">{item.title}</h4>
            <p className="hp-project-desc">{item.desc}</p>
            <div className="hp-project-tags">
              {item.tags.map((tag) => (
                <span className="hp-project-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}