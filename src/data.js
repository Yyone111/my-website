/* ===== 全站共享数据 ===== */

export const BRAND_TEXT = "YANG YAO";

// 顶部导航（同时也是页面路由表）
export const NAV_ITEMS = [
  { key: "home", label: "首页", index: "00", hash: "#/" },
  { key: "projects", label: "作品", index: "01", hash: "#/projects" },
  { key: "skills", label: "技能", index: "02", hash: "#/skills" },
  { key: "about", label: "关于", index: "03", hash: "#/about" },
  { key: "contact", label: "联系", index: "04", hash: "#/contact" },
];

export const TAGS = ["Elden Ring", "Valorant", "CS2", "Life", "Travel"];

export const PROFILE_HIGHLIGHTS = [
  "可承接网站重构与性能优化",
  "注重交互体验和可维护性",
  "长期更新博客与开源小工具",
];

export const CONTACT_ITEMS = [
  {
    label: "邮箱",
    value: "yangyao596@gmail.com",
    type: "email",
    href: "mailto:yangyao596@gmail.com",
  },
  { label: "在线状态", value: "工作日 10:00 - 22:00", type: "clock" },
];

export const STACK_FOCUS = [
  "React",
  "Vue",
  "TypeScript",
  "Node.js",
  "MongoDB",
  "Vite",
];

// 首页统计徽标
export const STATS = [
  { value: "6+", label: "技术栈深耕" },
  { value: "∞", label: "探索在路上" },
  { value: "24/7", label: "在线模式" },
];

// 精选作品
export const PROJECTS = [
  {
    key: "homepage",
    title: "HomePage 个人主页",
    desc: "React + Vite 单页站点，集成 AI 聊天助手与可拖拽浮窗，全端自适应。",
    detail:
      "从零搭建的个人站点：左右分栏的信息架构、流式 AI 对话、拖拽浮窗、多页转场，全站零 UI 框架依赖。",
    tags: ["React", "Vite", "AI"],
    tone: "#3f6cac",
    meta: "进行中 · 主要作品",
    icon: "rocket",
    category: "前端",
    year: "2026",
  },
  {
    key: "ai-assistant",
    title: "AI 站点助手",
    desc: "对话式 AI 助手，支持流式渲染、历史上下文与本地/线上双端切换。",
    detail:
      "基于 SSE 的流式回复链路，前端逐块渲染降低首字延迟；双环境端点自动切换，本地调试与线上部署零配置。",
    tags: ["Stream", "API", "UX"],
    tone: "#2f8f6b",
    meta: "已上线 · 流式回复",
    icon: "spark",
    category: "全栈",
    year: "2025",
  },
  {
    key: "toolbox",
    title: "开源小工具集",
    desc: "长期更新的效率工具与踩坑笔记，帮助后来者少走弯路。",
    detail:
      "把日常重复劳动沉淀成脚本与小组件：批量处理、格式转换、调试辅助，配套踩坑记录方便检索。",
    tags: ["Tools", "Blog", "OSS"],
    tone: "#9a6a2f",
    meta: "持续更新 · 开源",
    icon: "lab",
    category: "工具",
    year: "2025",
  },
  {
    key: "blog-engine",
    title: "轻量博客引擎",
    desc: "Markdown 驱动的静态博客，构建期渲染 + 增量更新，秒开体验。",
    detail:
      "以 Markdown 为唯一内容源，构建阶段生成静态页面；支持标签聚合、全文检索与 RSS 输出。",
    tags: ["Markdown", "SSG", "SEO"],
    tone: "#7a4fa8",
    meta: "已完成 · 自用中",
    icon: "note",
    category: "全栈",
    year: "2024",
  },
  {
    key: "data-dashboard",
    title: "数据看板组件库",
    desc: "面向后台系统的图表与表格组件集合，主题可配置、按需加载。",
    detail:
      "统一了图表配色与交互规范，抽象出可复用的查询表格、筛选面板与空态组件，减少后台重复开发。",
    tags: ["Charts", "Design", "React"],
    tone: "#2c6f8f",
    meta: "组件沉淀 · 复用",
    icon: "chart",
    category: "前端",
    year: "2024",
  },
  {
    key: "api-gateway",
    title: "个人 API 网关",
    desc: "统一鉴权、限流与日志的服务入口，Node.js 单进程可部署。",
    detail:
      "为多个小服务提供统一入口：Token 校验、按 IP 限流、结构化日志与健康检查，单机即可运行。",
    tags: ["Node.js", "Auth", "Log"],
    tone: "#8f5a3f",
    meta: "运维中 · 稳定",
    icon: "cloud",
    category: "后端",
    year: "2023",
  },
];

// 技能：首页概览用平铺，技能页按分组展示
export const SKILLS = [
  { name: "React", level: 88, note: "组件化 / Hooks / 状态管理" },
  { name: "Vue", level: 80, note: "Composition API / 生态工程" },
  { name: "TypeScript", level: 82, note: "类型系统 / 工程化实践" },
  { name: "Node.js", level: 78, note: "接口服务 / 流式响应" },
  { name: "MongoDB", level: 74, note: "数据建模 / 聚合查询" },
  { name: "Vite", level: 90, note: "构建工具 / 开发体验" },
];

export const SKILL_GROUPS = [
  {
    title: "前端 · 交互与体验",
    icon: "code",
    desc: "把复杂交互拆成可维护的组件，追求手感与可访问性。",
    items: [
      { name: "React", level: 88, note: "Hooks、组件设计、状态管理" },
      { name: "Vue", level: 80, note: "Composition API、生态工程" },
      { name: "TypeScript", level: 82, note: "类型系统、工程化实践" },
      { name: "CSS / 动效", level: 86, note: "布局、过渡、性能友好动画" },
    ],
  },
  {
    title: "后端 · 服务与数据",
    icon: "cloud",
    desc: "从接口契约到数据模型，保证链路稳定可观测。",
    items: [
      { name: "Node.js", level: 78, note: "接口服务、流式响应" },
      { name: "MongoDB", level: 74, note: "数据建模、聚合查询" },
      { name: "RESTful API", level: 80, note: "契约设计、错误码规范" },
      { name: "部署运维", level: 70, note: "Render / 日志 / 健康检查" },
    ],
  },
  {
    title: "工程化 · 构建与协作",
    icon: "chart",
    desc: "让团队少踩坑：构建速度、规范、可回滚的发布。",
    items: [
      { name: "Vite", level: 90, note: "构建工具、开发体验" },
      { name: "Git 工作流", level: 84, note: "分支策略、Code Review" },
      { name: "性能优化", level: 78, note: "首屏、懒加载、包体积" },
      { name: "测试与质量", level: 72, note: "单元测试、静态检查" },
    ],
  },
];

// 成长足迹
export const TIMELINE = [
  {
    period: "2026",
    text: "持续打磨个人站点：AI 助手接入、流式聊天可视化、动效体系化。",
  },
  {
    period: "2025",
    text: "搭建 HomePage 全栈架构：React 前端 + Node 后端 + Render 部署。",
  },
  { period: "2024", text: "系统输出博客与技术笔记，沉淀前端工程化实践。" },
  { period: "2023", text: "踏足全栈开发，从 Vue 走向 React 与 Node.js。" },
];

// 关于页的详细时间线
export const MILESTONES = [
  {
    period: "2026",
    title: "动效与体验体系化",
    text: "为站点引入多页转场、流式对话与更克制的动效语言，把交互细节当作产品的一部分来做。",
    tag: "进行中",
  },
  {
    period: "2025",
    title: "全栈架构落地",
    text: "React 前端 + Node 后端 + Render 部署，打通从开发到上线的完整链路。",
    tag: "已上线",
  },
  {
    period: "2024",
    title: "输出与沉淀",
    text: "持续写博客与技术笔记，把踩过的坑整理成可复用的工程化经验。",
    tag: "持续",
  },
  {
    period: "2023",
    title: "从 Vue 走向全栈",
    text: "在 Vue 生态里打好基础后转向 React 与 Node.js，开始独立承担完整项目。",
    tag: "起点",
  },
];

// Hero 打字机轮换语录
export const HERO_SLOGANS = [
  { text: "永远在路上 · 保持输出与探索", accent: "gradientText" },
  { text: "Fall In Life · Love", accent: "purpleText" },
  { text: "全栈开发 · 热爱设计与交互", accent: "gradientText" },
];

// 联系页卡片
export const CONTACT_CARDS = [
  {
    key: "email",
    label: "邮箱",
    value: "yangyao596@gmail.com",
    desc: "合作、外包或技术交流，工作日通常 24 小时内回复。",
    icon: "email",
    href: "mailto:yangyao596@gmail.com",
    action: "写封邮件",
  },
  {
    key: "qq",
    label: "QQ",
    value: "扫码添加",
    desc: "更适合即时沟通，扫码后直接发起对话。",
    icon: "chat",
    action: "显示二维码",
  },
  {
    key: "bilibili",
    label: "Bilibili",
    value: "space.bilibili.com/456713538",
    desc: "日常记录、折腾过程与一些不太正经的分享。",
    icon: "play",
    href: "https://space.bilibili.com/456713538",
    action: "前往主页",
  },
  {
    key: "time",
    label: "在线时间",
    value: "工作日 10:00 - 22:00",
    desc: "其它时间消息可能延迟处理，看到会回。",
    icon: "clock",
  },
];
