import { useEffect, useRef, useState } from "react";

const TAGS = ["前端", "全栈", "Vue", "Node", "CS2", "生活记录"];

const SKILLS = [
  { name: "HTML/CSS", percent: "90%" },
  { name: "JavaScript", percent: "85%" },
  { name: "Java", percent: "80%" },
  { name: "Redis", percent: "76%" },
  { name: "Nginx", percent: "78%" },
  { name: "SpringBoot", percent: "82%" },
];

const PROJECTS = [
  {
    title: "个人博客系统",
    description:
      "使用Vue.js和Node.js构建的全栈博客系统，支持文章发布、评论互动和后台管理。",
    tags: ["Vue.js", "Node.js", "MongoDB"],
    action: "查看详情",
    imageAlt: "个人博客系统",
  },
  {
    title: "校园生活助手",
    description: "课表、待办、签到、共享文件，一站式学生效率工具。",
    tags: ["React", "TypeScript", "SQLite"],
    action: "即将上线",
    imageAlt: "校园生活助手",
  },
  {
    title: "动效组件库",
    description: "为个人站点定制的轻量级 UI + 动效组件集合。",
    tags: ["GSAP", "CSS", "UI/UX"],
    action: "预览 Demo",
    imageAlt: "动效组件库",
  },
];

const FEATURE_CARDS = [
  {
    icon: "note",
    title: "博客",
    content: "记录我的技术学习、生活感悟和日常思考。分享前端开发、Java使用。",
  },
  {
    icon: "cloud",
    title: "云盘",
    content: "个人文件存储与分享空间。收集整理的技术文档、工具软件、电子书等资源。",
  },
  {
    icon: "lab",
    title: "实验室",
    content: "我的创意实验场，展示各种有趣的HTML/CSS/JS作品和技术demo。",
  },
  {
    icon: "idea",
    title: "开源",
    content: "正在整理的脚手架与小工具，欢迎 Star / Issue / PR。",
  },
];

const QUICK_STATS = [
  { label: "项目沉淀", value: "12+" },
  { label: "技术文章", value: "36" },
  { label: "活跃年限", value: "4Y" },
];

const TIMELINE_ITEMS = [
  { period: "近期目标", text: "完善个人博客与项目展示，持续输出高质量内容。" },
  { period: "正在学习", text: "TypeScript 工程化、性能优化和全栈架构设计。" },
  { period: "合作方向", text: "前端开发、网站重构、效率工具与创意交互页面。" },
];

const PROFILE_HIGHLIGHTS = [
  "可承接网站重构与性能优化",
  "注重交互体验和可维护性",
  "长期更新博客与开源小工具",
];

const CONTACT_ITEMS = [
  {
    label: "邮箱",
    value: "yangyao596@gmail.com",
    type: "email",
    href: "mailto:yangyao596@gmail.com",
  },
  { label: "在线状态", value: "工作日 10:00 - 22:00", type: "clock" },
];

const STACK_FOCUS = ["React", "Vue", "TypeScript", "Node.js", "MongoDB", "Vite"];
const CONTENT_TABS = [
  { id: "work", label: "Work" },
  { id: "now", label: "Now" },
  { id: "about", label: "About" },
];

function UiIcon({ name, className = "ui-icon" }) {
  const icons = {
    spark: (
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
    ),
    code: <path d="M9 8L5 12l4 4M15 8l4 4-4 4M13 6l-2 12" />,
    pin: <path d="M12 21s6-5.1 6-10a6 6 0 10-12 0c0 4.9 6 10 6 10zM12 13a2 2 0 100-4 2 2 0 000 4z" />,
    note: <path d="M7 4h10a2 2 0 012 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 012-2h2" />,
    cloud: <path d="M8 18h9a4 4 0 10-.7-7.9A5 5 0 007 11a3 3 0 001 7z" />,
    lab: <path d="M10 3h4M10 3v4l-4 8a3 3 0 003 4h6a3 3 0 003-4l-4-8V3" />,
    idea: <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3 11c.7.5 1.2 1.3 1.2 2.2h3.6c0-.9.5-1.7 1.2-2.2A6 6 0 0012 3z" />,
    chart: <path d="M5 19h14M8 16V9M12 16V5M16 16v-7" />,
    rocket: <path d="M5 19l4-1 9-9a4 4 0 00-5-5l-9 9-1 4 2 2zM12 7l5 5" />,
    email: <path d="M4 7h16v10H4zM4 8l8 6 8-6" />,
    clock: <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    check: <path d="M5 13l4 4L19 7" />,
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      {icons[name] || icons.spark}
    </svg>
  );
}

function App() {
  const rootRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("work");
  const formatBeijingTime = () =>
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(new Date());
  const [currentTime, setCurrentTime] = useState(() =>
    formatBeijingTime()
  );

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(formatBeijingTime());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    const cards = rootRef.current.querySelectorAll(".function-card, .project-card");
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="site-top-line">
        <div className="site-top-left">
          <span className="site-top-name">YANG YAO</span>
        </div>
        <div className="site-top-right">
          <span className="site-top-time">{currentTime} 北京时间</span>
          <span className="site-top-work">Open for work</span>
        </div>
      </div>

      <div
        id="qqModal"
        className="modal"
        style={{ display: isModalOpen ? "block" : "none" }}
        onClick={(event) => event.target.id === "qqModal" && setIsModalOpen(false)}
      >
        <span className="close" onClick={() => setIsModalOpen(false)}>
          &times;
        </span>
        <img className="modal-content" id="qqImage" src="/static/img/qqnumber.jpg" alt="QQ二维码" />
      </div>

      <div className="yy-main" ref={rootRef}>
        <aside className="yy-left">
          <div className="profile-card">
            <div className="avatar-container">
              <img src="/static/img/head.jpg" alt="Yycjy" className="avatar" />
              <div className="emoji-badge emoji-1">
                <UiIcon name="spark" className="badge-icon" />
              </div>
              <div className="emoji-badge emoji-2">
                <UiIcon name="code" className="badge-icon" />
              </div>
            </div>

            <div className="info-item">
              <a href="https://cn.gullmap.com/is" target="_blank" rel="noreferrer">
                <span className="info-icon">
                  <UiIcon name="pin" />
                </span>
                <span>ALLWORLD • Iceland</span>
              </a>
            </div>

            <div>
              <a
                href="https://space.bilibili.com/456713538"
                className="domain"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://www.bilibili.com/favicon.ico"
                  alt="Bilibili"
                  style={{ width: "30px", height: "30px", verticalAlign: "middle" }}
                />
              </a>
              <button
                type="button"
                className="domain"
                onClick={() => setIsModalOpen(true)}
                style={{ background: "transparent", border: "none", padding: "5px" }}
                aria-label="打开QQ二维码"
              >
                <img
                  src="/static/img/qq.ico"
                  alt="QQ"
                  style={{ width: "30px", height: "30px", verticalAlign: "middle", cursor: "pointer" }}
                />
              </button>
            </div>

            <h3 className="title">个人标签</h3>
            <div className="tags">
              {TAGS.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="left-panel-block">
              <h3 className="title">个人简介</h3>
              <div className="left-highlight-list">
                {PROFILE_HIGHLIGHTS.map((item) => (
                  <p key={item} className="left-highlight-item">
                    <span className="left-highlight-icon">
                      <UiIcon name="check" />
                    </span>
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="left-panel-block">
              <h3 className="title">快速联系</h3>
              <div className="left-contact-list">
                {CONTACT_ITEMS.map((item) => {
                  const content = (
                    <>
                      <span className="left-contact-icon">
                        <UiIcon name={item.type} />
                      </span>
                      <span className="left-contact-label">{item.label}</span>
                      <span className="left-contact-value">{item.value}</span>
                    </>
                  );

                  if (item.href) {
                    return (
                      <a key={item.label} className="left-contact-item" href={item.href}>
                        {content}
                      </a>
                    );
                  }

                  return (
                    <div key={item.label} className="left-contact-item">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="left-panel-block">
              <h3 className="title">技术栈方向</h3>
              <div className="stack-focus-list">
                {STACK_FOCUS.map((item) => (
                  <span key={item} className="stack-focus-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="left-panel-block skills-section">
              <h3 className="title">技术技能</h3>
              {SKILLS.map((skill) => (
                <div className="skill-item" key={skill.name}>
                  <div className="skill-info">
                    <span>{skill.name}</span>
                    <span>{skill.percent}</span>
                  </div>
                  <div className="skill-bar">
                    <div className="skill-progress" style={{ width: skill.percent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="yy-right">
          <header>
            <section className="hero-landing">
              <h1 className="hero-landing-title">
                Hello, I'm <span className="gradientText">Yy</span>
              </h1>
              <p className="hero-landing-subtitle">
                <span className="purpleText">Full Stack</span> Developer · 记录热爱
              </p>
              <p className="hero-landing-subtitle">永远在路上 · 保持输出与探索</p>
            </section>

          </header>

          <main />
        </section>
      </div>

      <nav className="top-tab-nav" aria-label="内容切换导航">
        <a className="top-tab-brand" href="/" aria-label="网站首页">
          <img src="/static/img/me.ico" alt="Yy 图标" className="top-tab-brand-icon" />
        </a>
        {CONTENT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}

export default App;
