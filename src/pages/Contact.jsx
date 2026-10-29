import UiIcon from "../components/UiIcon";
import { CONTACT_CARDS } from "../data";

export default function Contact({ onOpenQQ }) {
  return (
    <div className="page-shell">
      <header className="page-head reveal" style={{ "--i": 0 }}>
        <p className="page-head-kicker">04 — CONTACT</p>
        <h2 className="page-head-title">联系我</h2>
        <p className="page-head-desc">
          邮件最稳妥，QQ 最快。说清楚背景和想做的事，回复会更有效率。
        </p>
      </header>

      <div className="contact-grid">
        {CONTACT_CARDS.map((item, index) => {
          const content = (
            <>
              <span className="contact-card-icon">
                <UiIcon name={item.icon} />
              </span>
              <div className="contact-card-body">
                <p className="contact-card-label">{item.label}</p>
                <p className="contact-card-value">{item.value}</p>
                <p className="contact-card-desc">{item.desc}</p>
              </div>
              {item.action ? (
                <span className="contact-card-action">
                  {item.action}{" "}
                  <UiIcon name="arrow" className="contact-arrow" />
                </span>
              ) : (
                <span className="contact-card-action contact-card-action-muted">
                  固定在线
                </span>
              )}
            </>
          );

          const cardClass = `contact-card reveal`;

          if (item.href) {
            return (
              <a
                key={item.key}
                className={cardClass}
                style={{ "--i": index + 1 }}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {content}
              </a>
            );
          }

          if (item.key === "qq") {
            return (
              <button
                key={item.key}
                type="button"
                className={`${cardClass} contact-card-button`}
                style={{ "--i": index + 1 }}
                onClick={onOpenQQ}
              >
                {content}
              </button>
            );
          }

          return (
            <div
              key={item.key}
              className={cardClass}
              style={{ "--i": index + 1 }}
            >
              {content}
            </div>
          );
        })}
      </div>

      <section
        className="function-card contact-cta reveal"
        style={{ "--i": 5 }}
      >
        <div className="contact-cta-text">
          <p className="page-head-kicker">AVAILABLE FOR WORK</p>
          <h3 className="contact-cta-title">正在寻找新的合作机会</h3>
          <p className="contact-cta-desc">
            可以承接网站重构、性能优化与全栈小项目，也可以只是聊聊技术。
            右下角的小Y也能先回答一些关于站点与经历的问题。
          </p>
        </div>
        <a
          className="hero-btn contact-cta-btn"
          href="mailto:yangyao596@gmail.com"
        >
          发送邮件 <UiIcon name="arrow" className="hero-btn-icon" />
        </a>
      </section>
    </div>
  );
}
