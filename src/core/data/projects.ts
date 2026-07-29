export const projectTechLines = [
  { key: "threejs", label: "Three.js / WebGL", note: "3D 场景 / 交互实验" },
  { key: "pwa", label: "PWA / Capacitor", note: "离线优先 / Android" },
  { key: "python", label: "Python", note: "本地工具 / OCR / Excel" },
  { key: "nextjs", label: "Next.js / React", note: "沉浸式交互 / TypeScript" },
  { key: "javascript", label: "JavaScript", note: "轻量原型 / localStorage" }
] as const;

export const projectEntries = [
  {
    id: "earth-online",
    title: "Earth Online",
    type: "Local-first WebGL",
    url: "https://github.com/Rain-dust/earth-online",
    line: "threejs",
    status: "实验原型",
    summary: "把现实人生包装成长久在线世界，用 3D 地球、每日主线和本地存档记录持续向前的痕迹。",
    details: ["Three.js", "原生 ES Modules", "localStorage"]
  },
  {
    id: "fushenglu",
    title: "浮生录",
    type: "Mobile PWA",
    url: "https://github.com/Rain-dust/fushenglu",
    line: "pwa",
    status: "可运行",
    summary: "用于文学摘录与人生感悟的本地优先移动端积累本，支持竖排阅读、印章和图片导出。",
    details: ["PWA", "Capacitor", "Android"]
  },
  {
    id: "mindcache",
    title: "MindCache",
    type: "Idea Archive",
    url: "https://github.com/Rain-dust/MindCache",
    line: "javascript",
    status: "轻量原型",
    summary: "一个浏览器内的想法库，用搜索、标签、优先级和归档视图保存灵光与废案。",
    details: ["Vanilla JavaScript", "localStorage", "无构建步骤"]
  },
  {
    id: "campus-reimburse-kit",
    title: "Campus Reimburse Kit",
    type: "Windows Desktop Tool",
    url: "https://github.com/Rain-dust/campus-reimburse-kit",
    line: "python",
    status: "开源维护",
    summary: "本地整理电子发票，按项目额度组合票据，并生成入库单、出库单与原始票据包。",
    details: ["Python / Flask", "PDF / OCR", "openpyxl"]
  },
  {
    id: "zhi-wei",
    title: "Zhi-Wei",
    type: "Immersive Novel",
    url: "https://github.com/Rain-dust/Zhi-Wei",
    line: "nextjs",
    status: "可部署原型",
    summary: "把小说世界整理成可导入的场景包，从角色身份进入互动训练，并在浏览器保存当前世界。",
    details: ["Next.js 14", "React / TypeScript", "OpenAI-compatible API"]
  },
  {
    id: "more-projects",
    title: "更多项目",
    type: "GitHub Repositories",
    url: "https://github.com/Rain-dust?tab=repositories",
    line: "javascript",
    status: "持续追加",
    summary: "查看 Rain_dust 的其他公开仓库与进行中的实验。",
    details: ["github.com/Rain-dust", "公开仓库", "持续更新"]
  }
] as const;

