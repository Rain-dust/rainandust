export const profileIdentity = {
  displayName: "寻辰沐雨",
  handle: "Rain_dust",
  siteName: "Vibe Coder",
  bio: "INTP / 白羊座。小说、动漫、玄学，什么都看一点。偶尔把脑洞做成东西。",
  github: "https://github.com/Rain-dust",
  email: "mailto:1223451146@qq.com"
} as const;

export const profileStatus = [
  "INTP / 白羊座",
  "小说、动漫、玄学，什么都看一点",
  "偶尔把脑洞做成东西"
] as const;

export const profileTech = [
  { key: "unity", name: "Unity3D", note: "游戏逻辑 / 互动实验" },
  { key: "blender", name: "Blender", note: "建模 / 场景 / 小道具" },
  { key: "ue5", name: "UE5", note: "正在学习中" },
  { key: "mmd", name: "MMD 制作", note: "动作 / 镜头 / 舞台感" },
  { key: "astrbot", name: "AstrBot", note: "插件开发 / 部署记录" }
] as const;

export const animeFavorites = [
  { key: "engage-kiss", title: "想要成为影之实力者", subtitle: "The Eminence in Shadow" },
  { key: "aobuta", title: "青春猪头少年系列", subtitle: "Rascal Does Not Dream" },
  { key: "mushoku-tensei", title: "无职转生", subtitle: "Mushoku Tensei" },
  { key: "charlotte", title: "夏洛特", subtitle: "Charlotte" },
  { key: "summer-pockets", title: "Summer Pockets", subtitle: "夏日口袋" },
  { key: "eromanga-sensei", title: "埃罗芒阿老师", subtitle: "Eromanga Sensei" },
  { key: "no-game-no-life", title: "游戏人生", subtitle: "No Game No Life" },
  { key: "railgun", title: "某科学的超电磁炮", subtitle: "A Certain Scientific Railgun" }
] as const;

export const xpFavorites = [
  { key: "catgirl", title: "猫娘", subtitle: "catgirl signal" },
  { key: "pink-hair", title: "粉毛", subtitle: "pink hair bias" },
  { key: "yandere", title: "病娇", subtitle: "sweet danger" },
  { key: "heavy-love", title: "重女", subtitle: "heavy love" }
] as const;

export const favoriteGames = [
  { key: "cyberpunk-2077", title: "赛博朋克 2077", subtitle: "Cyberpunk 2077" },
  { key: "the-finals", title: "终极角逐", subtitle: "THE FINALS" },
  { key: "kovaaks", title: "KovaaK's", subtitle: "aim trainer" },
  { key: "aimlabs", title: "Aimlabs", subtitle: "aim routine" }
] as const;

export const currentSignals = [
  { label: "正在学习", text: "UE5 的场景、材质和蓝图，把脑内小房间慢慢搭出来。" },
  { label: "最近在折腾", text: "AstrBot 插件、部署教程、以及能让博客动起来的小机关。" },
  { label: "今日电波", text: "技术可以严谨一点，呈现方式可以更像玩具一点。" }
] as const;

