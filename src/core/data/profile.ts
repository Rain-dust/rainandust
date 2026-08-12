import { portfolioPositioning, portfolioRoleLine } from "./portfolio.ts";

export const profileIdentity = {
  displayName: "寻辰沐雨",
  handle: portfolioPositioning.brand,
  siteName: portfolioRoleLine,
  bio: `${portfolioPositioning.introduction}${portfolioPositioning.personaTags[0]}。`,
  github: "https://github.com/Rain-dust",
  email: "mailto:1223451146@qq.com",
  emailAddress: "1223451146@qq.com"
} as const;

export const profileStatus = [
  portfolioRoleLine,
  `${portfolioPositioning.personaTags[0]}（人格标签）`,
  "INTP / 白羊座",
  "小说、网文、动漫、玄学都看一点",
  "想到什么，就做点什么"
] as const;

export const profileTech = [
  { key: "threejs", name: "Three.js / WebGL", note: "3D 场景 / 交互实验" },
  { key: "python", name: "Python", note: "本地工具 / OCR / Excel" },
  { key: "nextjs", name: "Next.js / React", note: "沉浸式交互 / TypeScript" },
  { key: "solidworks", name: "SolidWorks", note: "工业建模 / 装配体" },
  { key: "creo", name: "Creo", note: "参数化建模 / 工程设计" },
  { key: "autocad", name: "AutoCAD", note: "工程制图 / 二维图纸" },
  { key: "bambu3d", name: "拓竹 3D 打印", note: "切片 / 打印制造" },
  { key: "opencv", name: "OpenCV", note: "图像处理 / 传统视觉" },
  { key: "yolo", name: "YOLO", note: "目标检测 / 机器视觉" }
] as const;

export const animeFavorites = [
  {
    key: "eminence-in-shadow",
    title: "想要成为影之实力者",
    subtitle: "The Eminence in Shadow",
    image: "/rain-dust/home/shadow-home-poster.jpg"
  }
] as const;

export const xpFavorites = [
  {
    key: "white-hair",
    title: "白毛",
    subtitle: "white hair",
    image: "/images/blog/cover-summer-white-01.webp",
    imageAlt: "白毛角色插画",
    imagePosition: "72% 34%"
  },
  {
    key: "red-eyes",
    title: "红瞳",
    subtitle: "red eyes",
    image: "/images/blog/cover-violet-gaze-01.webp",
    imageAlt: "红瞳角色插画",
    imagePosition: "70% 46%"
  },
  {
    key: "barefoot-imagery",
    title: "赤足",
    subtitle: "barefoot imagery",
    image: "/themes/kisara/assets/blog/sharon-back-solo-v1.webp",
    imageAlt: "轻盈跃起的角色插画",
    imagePosition: "50% 42%"
  }
] as const;

export const favoriteReading = [
  {
    key: "novel",
    title: "小说",
    subtitle: "《荒原狼》 · Hermann Hesse",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/93/Hermann_Hesse_Der_Steppenwolf_1927.jpg",
    imageAlt: "赫尔曼·黑塞《荒原狼》1927 年版封面",
    imagePosition: "50% 50%"
  },
  {
    key: "web-fiction",
    title: "网文",
    subtitle: "《异兽迷城》 · 彭湃",
    image: "/images/about/beast-maze-cover.jpg",
    imageAlt: "《异兽迷城》封面",
    imagePosition: "50% 50%"
  },
  {
    key: "metaphysics",
    title: "玄学",
    subtitle: "Metaphysics",
    image: "/images/about/metaphysics-paper.png",
    imageAlt: "水墨、红线与卦象构成的玄学意象",
    imagePosition: "50% 50%"
  }
] as const;

export const currentSignals = [
  { label: "正在做", text: "自我未来模型、嘉豪 Skill" },
  { label: "最近在折腾", text: "桌面机器人、维护 Earth Online" },
  { label: "当前状态", text: "追番 ing" }
] as const;

