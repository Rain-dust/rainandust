export const projectTechLines = [
  { key: "unity", label: "WebGL / Three.js", note: "3D 场景 / 交互体验" },
  { key: "blender", label: "PWA / Capacitor", note: "离线优先 / Android 封装" },
  { key: "ue5", label: "Python / Windows", note: "本地工具 / OCR / Excel" },
  { key: "mmd", label: "Next.js / React", note: "沉浸式交互 / 静态部署" },
  { key: "astrbot", label: "Vanilla JavaScript", note: "轻量原型 / localStorage" }
] as const;

export const projectEntries = [
  {
    id: "astrbot-lab",
    title: "Earth Online",
    type: "Local-first WebGL",
    line: "unity",
    status: "实验原型",
    summary: "把现实人生包装成长久在线世界，用 3D 地球、每日主线和本地存档记录持续向前的痕迹。",
    details: ["Three.js", "原生 ES Modules", "localStorage"]
  },
  {
    id: "unity-toys",
    title: "浮生录",
    type: "Mobile PWA",
    line: "blender",
    status: "可运行",
    summary: "用于文学摘录与人生感悟的本地优先移动端积累本，支持竖排阅读、印章和图片导出。",
    details: ["PWA", "Capacitor", "Android"]
  },
  {
    id: "blender-props",
    title: "MindCache",
    type: "Idea Archive",
    line: "astrbot",
    status: "轻量原型",
    summary: "一个浏览器内的想法库，用搜索、标签、优先级和归档视图保存灵光与废案。",
    details: ["Vanilla JavaScript", "localStorage", "无构建步骤"]
  },
  {
    id: "ue5-room",
    title: "Campus Reimburse Kit",
    type: "Windows Desktop Tool",
    line: "ue5",
    status: "开源维护",
    summary: "本地整理电子发票，按项目额度组合票据，并生成入库单、出库单与原始票据包。",
    details: ["Python / Flask", "PDF / OCR", "openpyxl"]
  },
  {
    id: "mmd-camera",
    title: "Zhi-Wei",
    type: "Immersive Novel",
    line: "mmd",
    status: "可部署原型",
    summary: "把小说世界整理成可导入的场景包，从角色身份进入互动训练，并在浏览器保存当前世界。",
    details: ["Next.js 14", "React / TypeScript", "OpenAI-compatible API"]
  },
  {
    id: "yuimi-web-lab",
    title: "更多项目",
    type: "GitHub Repositories",
    line: "astrbot",
    status: "持续追加",
    summary: "查看 Rain_dust 的其他公开仓库与进行中的实验。",
    details: ["github.com/Rain-dust", "公开仓库", "持续更新"]
  }
] as const;

