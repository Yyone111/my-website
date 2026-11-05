/* ===== 全站共享数据 ===== */

export const BRAND_TEXT = "YANG YAO";

// 顶部导航（同时也是页面路由表）
export const NAV_ITEMS = [
  { key: "home", label: "首页", index: "00", hash: "#/" },
  { key: "projects", label: "作品", index: "01", hash: "#/projects" },
  { key: "skills", label: "技能", index: "02", hash: "#/skills" },
  { key: "about", label: "关于", index: "03", hash: "#/about" },
  { key: "travel", label: "旅行地图", index: "04", hash: "#/travel" },
  { key: "contact", label: "联系", index: "05", hash: "#/contact" },
  // hidden: 只注册路由、不出现在导航里；从旅行地图页底部入口进入
  {
    key: "travel-admin",
    label: "照片管理",
    index: "06",
    hash: "#/travel-admin",
    hidden: true,
  },
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

// 首页时光相册照片墙（瀑布流）
// 现在用 tone 渐变做占位；换成真实照片时，给对应条目加上 src 即可（会自动优先用图片）：
//   { id: 1, src: "/static/img/gallery/iceland.jpg", caption: "冰岛 · 黑沙滩", year: "2026" }
// 照片放到 public/static/img/gallery/ 下，路径写 /static/img/gallery/xxx.jpg
export const GALLERY = [
  {
    id: 1,
    caption: "冰岛 · 黑沙滩",
    year: "2026",
    tone: ["#2f3a4a", "#5f748c"],
  },
  {
    id: 2,
    caption: "挪威 · 森林晨雾",
    year: "2026",
    tone: ["#2f6b57", "#82b89d"],
  },
  { id: 3, caption: "城市夜景", year: "2025", tone: ["#2b2f6b", "#7b6fd0"] },
  { id: 4, caption: "沙漠 · 黄昏", year: "2025", tone: ["#b07a3f", "#e3bd82"] },
  {
    id: 5,
    caption: "阿尔卑斯 · 湖泊",
    year: "2025",
    tone: ["#2f6f9a", "#93c6e2"],
  },
  { id: 6, caption: "京都 · 秋色", year: "2024", tone: ["#a8512f", "#e2a463"] },
  { id: 7, caption: "海边 · 落日", year: "2024", tone: ["#c2593f", "#f0ab7c"] },
  { id: 8, caption: "星空露营", year: "2024", tone: ["#1f2a4a", "#53619e"] },
  { id: 9, caption: "春日 · 樱", year: "2023", tone: ["#c56a8f", "#f2bcd0"] },
  {
    id: 10,
    caption: "沿途 · 海线",
    year: "2023",
    tone: ["#2f7f8f", "#93d2da"],
  },
  {
    id: 11,
    caption: "东京 · 涩谷",
    year: "2023",
    tone: ["#5a2f6b", "#b781d3"],
  },
  {
    id: 12,
    caption: "卡帕多奇亚 · 日出",
    year: "2022",
    tone: ["#d08a4a", "#f2cda0"],
  },
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
    label: "哔哩哔哩",
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

/* ===== 旅行地图 ===== */

// 地图按省份状态上色，只改下面两个名单即可：
//   visited 去过   → 渐变（或真实照片）拼贴填充
//   wish    想去   → 描边高亮
//   两个名单之外的省级行政区一律算「还没去」，所以三个数字永远和地图对得上。
export const TRAVEL_PROVINCE_STATUS = {
  visited: [
    "北京",
    "辽宁",
    "山西",
    "河北",
    "上海",
    "江苏",
    "浙江",
    "安徽",
    "福建",
    "江西",
    "山东",
    "河南",
    "湖北",
    "湖南",
    "广东",
    "广西",
    "海南",
    "重庆",
    "四川",
    "贵州",
  ],
  wish: ["云南", "新疆", "西藏", "青海", "甘肃", "内蒙古", "黑龙江", "吉林"],
};

// 去过省份的拼贴配色，按 visited 名单顺序循环取用（每项是渐变的三段色）
export const TRAVEL_TONES = [
  ["#e8f4dc", "#a9d68b", "#7fbc5c"],
  ["#dff0e6", "#93cfa6", "#5fa87a"],
  ["#eaf3e0", "#b9dc9a", "#8cc169"],
  ["#e2f1ea", "#9fd3be", "#67ab90"],
  ["#edf5e2", "#c2e0a4", "#93c973"],
  ["#e4f2e2", "#a6d49f", "#74b86c"],
  ["#eef4e4", "#c6dfae", "#98c47c"],
  ["#e1efe8", "#a2cfc0", "#6ca995"],
  ["#e9f3dd", "#b4d98f", "#87bf63"],
  ["#e5f1e4", "#a8d2a6", "#79b778"],
];

// 想换成真实照片时，给对应省份补一条即可（没配的用渐变占位）：
//   浙江: { src: "/static/img/travel/hangzhou.jpg", caption: "杭州 · 西湖" }
// 照片放到 public/static/img/travel/ 下，路径写 /static/img/travel/xxx.jpg
export const TRAVEL_PHOTOS = {};

// public/static/img/travel/ 下已有的图片，管理页会列出来供你直接点选（新增图片后改这里）
export const TRAVEL_IMAGE_LIBRARY = [
  { label: "杭州 · 西湖", src: "/static/img/travel/hunan.png" },
  { label: "海边 · 黄昏", src: "/static/img/travel/cemina.jpg" },
  { label: "雪山 · 白宫", src: "/static/img/travel/whiteGong.jpg" },
  {
    label: "山野 · 远行",
    src: "/static/img/travel/e0e41b396623edcb6cf26a5571e647f4.jpg",
  },
];

// 管理页解锁密码
export const TRAVEL_ADMIN_PASSWORD = "yycjy0918";

// 「最新足迹」大图卡
export const TRAVEL_LATEST = {
  city: "厦门 · 鼓浪屿",
  date: "2024.06.14",
  note: "第一次一起看海，风很温柔，你也很美。",
  tone: ["#cfe4ef", "#f0dcc6"],
};

// 「最近足迹」列表
// 想换成真实照片时给对应条目加 src 即可（没配的用渐变占位）：
//   { id: 1, city: "杭州 · 西湖", date: "2024.05.20", src: "/static/img/travel/hangzhou.jpg", tone: [...] }
export const TRAVEL_RECENT = [
  {
    id: 1,
    city: "杭州 · 西湖",
    date: "2024.05.20",
    tone: ["#dbead8", "#a9cfa4"],
  },
  {
    id: 2,
    city: "张家界 · 袁家寨子",
    date: "2024.04.15",
    tone: ["#dfeae0", "#9fc4ab"],
  },
  {
    id: 3,
    city: "重庆 · 洪崖洞",
    date: "2024.03.22",
    tone: ["#f0e2d2", "#d0a97f"],
  },
  {
    id: 4,
    city: "大理 · 洱海",
    date: "2024.03.08",
    tone: ["#d8e8ee", "#a3c3d4"],
  },
  {
    id: 5,
    city: "青岛 · 八大关",
    date: "2024.02.11",
    tone: ["#e2ecec", "#a9c9c4"],
  },
];
