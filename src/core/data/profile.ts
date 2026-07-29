export const profileIdentity = {
  displayName: "寻辰沐雨",
  handle: "Rain_dust",
  siteName: "Vibe Coder",
  bio: "Vibe Coder。INTP / 白羊座。小说、网文、动漫、玄学都看一点。想到什么，就做点什么。",
  github: "https://github.com/Rain-dust",
  email: "mailto:1223451146@qq.com"
} as const;

export const profileStatus = [
  "Vibe Coder",
  "INTP / 白羊座",
  "小说、网文、动漫、玄学都看一点",
  "想到什么，就做点什么"
] as const;

export const profileTech = [
  { key: "threejs", name: "Three.js / WebGL", note: "3D 场景 / 交互实验" },
  { key: "pwa", name: "PWA / Capacitor", note: "离线优先 / Android" },
  { key: "python", name: "Python", note: "本地工具 / OCR / Excel" },
  { key: "nextjs", name: "Next.js / React", note: "沉浸式交互 / TypeScript" },
  { key: "javascript", name: "JavaScript", note: "轻量原型 / localStorage" }
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
  { key: "white-hair", title: "白发", subtitle: "white hair", icon: "tabler:sparkles" },
  { key: "red-eyes", title: "红瞳", subtitle: "red eyes", icon: "tabler:eye" },
  { key: "quiet-mystery", title: "神秘感", subtitle: "quiet mystery", icon: "tabler:moon-stars" },
  { key: "barefoot-imagery", title: "赤足意象", subtitle: "barefoot imagery", icon: "tabler:shoe-off" }
] as const;

export const favoriteReading = [
  { key: "novel", title: "小说", subtitle: "Novel", icon: "tabler:book-2" },
  { key: "web-fiction", title: "网文", subtitle: "Web Fiction", icon: "tabler:books" },
  { key: "metaphysics", title: "玄学", subtitle: "Metaphysics", icon: "tabler:moon-stars" }
] as const;

export const currentSignals = [
  { label: "正在做", text: "完善这个个人网站。" },
  { label: "最近在折腾", text: "Earth Online、浮生录和一些小项目。" },
  { label: "当前状态", text: "Vibe Coding。" }
] as const;

