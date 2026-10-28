import UiIcon from "../components/UiIcon";
import { MILESTONES, PROFILE_HIGHLIGHTS, TAGS } from "../data";

const PRINCIPLES = [
  {
    icon: "idea",
    title: "先想清楚再写",
    text: "把需求拆成能验证的小块，方案定下来再动手，避免返工。",
  },
  {
    icon: "code",
    title: "代码是写给人看的",
    text: "命名、分层、注释服务于后来者，也包括半年后的自己。",
  },
  {
    icon: "rocket",
    title: "交付要能被验证",
    text: "跑得起来、点得通、测得过的功能，才算真的做完。",
  },
];

export default function About({ onNavigate }) {
  return (
    <div className="page-shell">
      <header className="page-head reveal" style={{ "--i": 0 }}>
        <p className="page-head-kicker">03 — ABOUT</p>
        <h2 className="page-head-title">关于我</h2>
        <p className="page-head-desc">
          一个喜欢把界面做得顺手的全栈开发者。技术是手段，让东西好用才是目的。
        </p>
      </header>

      <section className="function-card reveal" style={{ "--i": 1 }}>
        <header className="card-header">
          <span className="card-icon">
            <UiIcon name="idea" />
          </span>
          <h3 className="card-title">简介</h3>
        </header>
        <div className="about-story">
          <p>
            我是 Yy，目前专注 React / Vue 前端与 Node.js
            后端。日常在做的两件事：把复杂交互拆成清晰的组件，把零散需求整理成能上线的服务。
          </p>
          <p>
            喜欢折腾个人站点，从布局、动效到接口链路都自己动手。对性能与可维护性有执念，
            会为了一个过渡动画的缓动曲线反复调，也会为了首屏体积删掉半个依赖。
          </p>
        </div>
        <div className="about-facts about-facts-standalone">
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
        <div className="tags about-tags">
          {TAGS.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="function-card reveal" style={{ "--i": 2 }}>
        <header className="card-header">
          <span className="card-icon">
            <UiIcon name="chart" />
          </span>
          <h3 className="card-title">成长里程碑</h3>
        </header>
        <ol className="milestone-list">
          {MILESTONES.map((item) => (
            <li className="milestone-item" key={item.period}>
              <span className="milestone-dot" aria-hidden="true" />
              <div className="milestone-body">
                <div className="milestone-head">
                  <span className="milestone-period">{item.period}</span>
                  <span className="milestone-tag">{item.tag}</span>
                </div>
                <h4 className="milestone-title">{item.title}</h4>
                <p className="milestone-text">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="principle-grid">
        {PRINCIPLES.map((item, index) => (
          <section
            className="function-card principle-card reveal"
            style={{ "--i": index + 3 }}
            key={item.title}
          >
            <span className="principle-icon">
              <UiIcon name={item.icon} />
            </span>
            <h4 className="principle-title">{item.title}</h4>
            <p className="principle-text">{item.text}</p>
          </section>
        ))}
      </div>

      <section className="function-card about-cta reveal" style={{ "--i": 6 }}>
        <div>
          <h4 className="about-cta-title">有想法想聊聊？</h4>
          <p className="about-cta-text">
            无论是合作、外包还是纯粹的技术交流，都欢迎直接找我。
          </p>
        </div>
        <button
          type="button"
          className="hero-btn"
          onClick={() => onNavigate("contact")}
        >
          联系我 <UiIcon name="arrow" className="hero-btn-icon" />
        </button>
      </section>

      <section className="function-card reveal" style={{ "--i": 7 }}>
        <header className="card-header">
          <span className="card-icon">
            <UiIcon name="check" />
          </span>
          <h3 className="card-title">我在意的事</h3>
        </header>
        <div className="left-highlight-list about-highlight-list">
          {PROFILE_HIGHLIGHTS.map((item) => (
            <p key={item} className="left-highlight-item">
              <span className="left-highlight-icon">
                <UiIcon name="check" />
              </span>
              {item}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
