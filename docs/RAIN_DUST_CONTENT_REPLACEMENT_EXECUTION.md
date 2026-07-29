# Rain_dust 内容归属替换执行稿

版本：Content Pass / Batch 3  
执行方式：自主完成、验证、提交并发布到现有 Sites 项目  
目标项目：`D:/Users/Documents/个人作品集/rain-dust-portfolio`

## 给执行 Codex 的直接命令

在已经发布并通过验收的 Yuimi exact port 上，完成一次“内容归属替换”。

这一轮不是改版。公开站点只保留默认 Fuyukawa Kagari 的页面结构、布局、动画、交互和响应式；移除 Blank、Kisara 的切换入口与公开网址，并完整删除 HOME 左下角 Live2D/看板娘挂件；同时清除仍然冒充 Rain_dust 个人信息的上游内容、错误偏好和错误技术栈，并换成已经明确、可验证的 Rain_dust 内容。

连续完成检查、实施、测试、视觉验收、提交和现有站点发布，不在子步骤之间等待用户确认。遇到没有真实资料的内容时，使用简短空状态或减少条目，禁止编造。

## 一、当前生产基线

- 生产站点：`https://rain-dust-portfolio.workspace-852244.chatgpt.site`
- 当前 Sites 版本：`v21`
- 当前分支：`codex/yuimi-exact-port-batch1`
- 当前提交：`07ef3678d097670dc82fb846a0f30591e8b4e844`
- 生产回滚点：Sites `v21`
- 旧版第二回滚点：Sites `v18` / `8cb81cc`
- 上游锁定提交：`6b1dc0199d1fb824081f777c5f798ac933e8a94c`
- `RIGHTS_CONFIRMED = YES`
- 当前工作区在上一轮报告中为干净状态。
- 当前 npm audit 的 22 项上游依赖告警不属于本批次。

先核对实际 Git、Sites 配置和工作区，不要只相信这份文稿。如果已有新提交或用户改动，阅读并保护它们，不使用 `git reset --hard`。

## 二、本轮唯一目标

访问者在 HOME、BLOG、WORKS、ME 中看到的个人身份、偏好、技术栈、作品、文章和社交链接都必须属于 Rain_dust，或者明确显示为空；不得继续把 Yuimi 的个人经历、技术栈、番剧、游戏、XP 或文章当成 Rain_dust 的内容。公开站点不得再提供 Blank、Kisara 的导航入口、路径映射或可访问页面。

完成后应保持：

> 好看仍然来自 Yuimi 主题实现；“这个人是谁”全部来自 Rain_dust 的真实资料。

## 三、最新真理与冲突处理

内容事实可参考：

- `docs/PERSONAL_SITE_GOAL.md` 中的身份、隐私和兴趣信息。
- 当前对话和本执行稿列出的新增决定。
- 五个真实 GitHub 仓库的 README、依赖和源码。

但 `PERSONAL_SITE_GOAL.md` 中关于自创 HOME、塔罗 WORKS、书页 ME 等旧架构已经被后续“完整采用 Yuimi 源码”的决定覆盖。不要复活这些旧布局，也不要把网站改回上一版方案。

优先级：

1. 本执行稿。
2. 已发布的 Yuimi exact port 结构。
3. `PERSONAL_SITE_GOAL.md` 中不冲突的身份与隐私事实。
4. 真实仓库数据。

## 四、核心原则

- 不编造比保留空位更重要。
- 短句比 AI 式自我包装更重要。
- 作品能力由真实仓库证明，不写“擅长”“精通”等自我吹嘘。
- 只替换内容归属，不重新设计界面。
- 默认 Fuyukawa 是唯一公开主题；Blank、Kisara 不再属于用户旅程。
- HOME 左下角不再需要看板娘、Live2D、静态 fallback 或其浮动控制按钮；必须移除实现，不用 CSS 欺骗性隐藏。
- 技术内部标识和作者归属说明不等于可见个人资料，不做机械全局替换。
- 删除的上游文章仍可从锁定上游和 Git 历史恢复，不在目标生产站继续展示。

## 五、开始前检查

开始时用不超过 8 行报告检查结果和最小修改方案，然后直接实施。

必须检查：

1. `git status --short`、当前分支、HEAD、与 `07ef367` 的关系。
2. `.openai/hosting.json` 的真实项目 ID和当前 Sites 生产版本。
3. `docs/YUIMI_RELEASE_CANDIDATE_REPORT.md` 和生产验收证据。
4. `src/core/data/profile.ts`、`src/core/data/projects.ts`、`src/lib/site.ts`。
5. 默认 Fuyukawa 的 HOME、BLOG、WORKS、ME 页面，现有 Blank/Kisara 路由和主题切换入口，以及 BaseLayout 中 Live2D/waifu 的完整实现链路。
6. `src/content/blog/` 的真实文章和作者元数据。
7. 所有可见文本中的 Yuimi、Asteria、旧技术栈、旧番剧、旧 XP、旧游戏和旧社交链接。
8. 是否存在新的 `AGENTS.md` 或项目级约束。

从当前生产提交创建新分支：

`codex/rain-dust-content-pass`

不要改写或删除 `codex/yuimi-exact-port-batch1`。

## 六、移除 Blank / Kisara 公开跳转

用户不需要 Blank 和 Kisara 的网址与主题切换。默认 Fuyukawa Kagari 是唯一公开主题。

### 必须删除

- 所有可见的 Blank、Kisara 主题切换按钮、长按菜单选项、右键菜单选项和快捷入口。
- `/themes/blank/` 及其 HOME、BLOG、WORKS、ME、文章和 404 路由。
- `/themes/kisara/` 及其 HOME、BLOG、WORKS、ME、文章和 404 路由。
- registry 中将 canonical 路径映射到 Blank/Kisara 的公开路由能力。
- sitemap、预取、route warmup、Pagefind 和构建产物中的 Blank/Kisara 页面 URL。

旧 URL 不要跳回 HOME，也不要偷偷切换主题：

```text
/themes/blank/*
/themes/kisara/*
```

它们统一返回当前默认主题的自定义 HTTP 404。

### 旧主题偏好迁移

已有访客可能在 `yuimi-theme-id-v1` 中保存了 `blank` 或 `kisara`。访问新版本时必须：

1. 自动回到 Fuyukawa 默认主题。
2. 把失效偏好清除或迁移为默认值。
3. 不出现跳转循环、白屏或先闪出旧主题再回默认主题。
4. 不清除音乐、公告、动效等其他无关用户偏好。

### 源码与资源边界

- 可以保留 `src/themes/blank/`、`src/themes/kisara/` 和对应公开素材作为上游参考及回滚资源，只要它们不再被页面入口导入、不生成路由、不进入导航和 sitemap。
- 如果构建系统仍会打包或暴露死路由，应删除对应 `src/pages/themes/...` 路由文件，而不是重写整个主题源码。
- Fuyukawa 的右键菜单、音乐开关、樱花开关等非主题切换功能继续保留。
- 不把移除主题入口扩大成清理所有 `Kisara` 类名、文件名、音频或历史文档。

## 七、Rain_dust 的唯一公开身份

以下内容是本批次可直接使用的事实：

| 字段 | 内容 |
| --- | --- |
| 中文网名 | 寻辰沐雨 |
| 英文网名 | Rain_dust |
| 身份 | Vibe Coder |
| 人格 / 星座 | INTP / 白羊座 |
| 兴趣 | 小说、网文、动漫、玄学 |
| GitHub | `https://github.com/Rain-dust` |
| Email | `mailto:1223451146@qq.com` |
| 头像 | `/rain-dust/me/rain-dust-avatar.jpg` |
| HOME 视频 | `/rain-dust/home/shadow-home-loop.mp4` |
| HOME 海报 | `/rain-dust/home/shadow-home-poster.jpg` |

全站禁止公开：

- 真实姓名。
- 学校。
- 专业。
- 所在城市。
- 年龄。
- 其他未经确认的现实身份。

统一短文案：

```text
Vibe Coder。
INTP / 白羊座。
小说、网文、动漫、玄学都看一点。
想到什么，就做点什么。
```

不要扩写成“兴趣驱动型创作者”“在技术与幻想之间探索”之类 AI 文案。

## 八、HOME 内容替换

保留 HOME 的全部视觉、视频、公告、tag rain、头像终端、滚动和生命周期实现，只换不真实的内容。

### 完整删除左下角 Live2D / 看板娘

截图所示的整块内容不需要：

- 左下角 Live2D 或本地静态看板娘角色。
- 角色旁的拍照、关闭等圆形按钮。
- Live2D 状态气泡和提示。
- 侧边 TOOLS 面板中的“Live2D 控制台”区块。
- 显示/隐藏、说句话、换模型、换衣服等控制。

这不是默认隐藏功能，而是移除功能。

在 `src/themes/fuyukawa-kagari/layouts/BaseLayout.astro` 中：

- 删除 `.live2d-control-widget` 对应的 HTML。
- 删除 `live2dBase`、加载外部 CSS/JS、`initWidget`、路由同步、模型重载、fallback、消息、显隐和相关事件监听。
- 删除运行时注入或操作的 `#waifu`、`#live2d`、`#waifu-tool`、`#waifu-toggle`、`#waifu-tips`、`.waifu-local-fallback`。
- 删除对 jsDelivr `live2d-widgets`、`live2d_api` 和 Cubism Core 的运行时请求。
- 保证删除代码时不伤及其后紧邻的音乐播放器初始化。

在样式和页面局部覆盖中：

- 删除只服务于 `.live2d-*`、`#waifu*`、`.waifu-local-*` 的 CSS。
- 删除 About/Projects 等页面中只为看板娘定位写的 `:global(.waifu-...)` 覆盖。
- 不删除仍用于音乐播放器的 `.toy-dock`、`.toy-dock-handle`、`.toy-dock-panel` 和 music widget；TOOLS 抽屉保留为音乐播放器入口。

状态清理：

- 新代码不得继续读取或写入 `waifu-display`、`modelId`、`modelTexturesId`。
- 可以安全清理这些已经失效的旧 key，但不得清除音乐、公告、樱花和其他偏好。
- ClientRouter 连续进出 HOME 时不得重新注入角色、canvas、控制按钮或外部脚本。

资源清理：

- 先通过引用扫描确认，再删除只被本地看板娘 fallback 使用的角色图片。
- 用户头像 `/rain-dust/me/rain-dust-avatar.jpg` 仍用于 HOME profile 和 ME，不得误删。
- Fuyukawa 漫画背景、猪猪品牌和音乐素材继续保留。

### 必须替换

- `asteria@lab:~$` → `rain@home:~$`
- 打字命令 `pin --dev-notes --anime-diary` → `vibe --build`
- `Personal scrapbook / Anime diary` → `Personal site / Anime & code`
- `anime notes / tiny toys / dev memo` → `ideas / code / anime`

### falling tags

删除这些未经用户确认或明显来自上游作者的标签：

- Unity3D
- Blender
- UE5
- MMD
- AstrBot
- 猫娘
- 粉毛
- 病娇
- 重女
- 契约之吻
- 青春猪头少年
- 无职转生
- 夏洛特
- Summer Pockets
- 埃罗芒阿老师
- 游戏人生
- 超电磁炮
- Cyberpunk 2077
- THE FINALS
- KovaaK's
- Aimlabs
- 小游戏

替换为有事实依据的标签：

```text
Rain_dust
寻辰沐雨
Vibe Coder
INTP
白羊座
小说
网文
动漫
玄学
想要成为影之实力者
Three.js
WebGL
PWA
Capacitor
Python
OCR
Next.js
React
TypeScript
JavaScript
localStorage
Earth Online
浮生录
MindCache
Campus Reimburse Kit
知微
```

可以保留 `Rain_dust Radio`。`Live2D` 标签必须删除，因为对应功能在本批次完整移除。

### 其他要求

- HOME 标题继续使用 `Rain_dust`。
- Profile 继续显示“寻辰沐雨 / Rain_dust”和真实 GitHub、Email。
- 不添加作品、文章或长自我介绍到 HOME。
- 不改变视频选段、自动播放、循环、裁切和已经通过的生命周期修复。
- 公告系统中已经是通用节日/历史内容的条目可以保留；只替换其中错误的个人身份，不重写整套公告。

## 九、真实技术栈

当前 `profileTech` 中的 Unity3D、Blender、UE5、MMD、AstrBot 不属于已确认的 Rain_dust 技术栈，必须全部删除。

基于现有五个项目，目前可以使用：

| key | 名称 | 说明 |
| --- | --- | --- |
| `threejs` | Three.js / WebGL | 3D 场景 / 交互实验 |
| `pwa` | PWA / Capacitor | 离线优先 / Android |
| `python` | Python | 本地工具 / OCR / Excel |
| `nextjs` | Next.js / React | 沉浸式交互 / TypeScript |
| `javascript` | JavaScript | 轻量原型 / localStorage |

执行前再次核对五个仓库。只有仓库事实支持时才保留这些说明；发现不准确就按 README 和依赖修正。

同步修改共享数据和默认 Fuyukawa 的 presentation map、图标、短代码和 WORKS 技术线，但保持原卡片、轨道、动画和空间布局。Blank/Kisara 不再是公开页面，不需要为它们继续维护同一份展示数据。

建议图标只使用项目已有的 Astro Icon 集合中真实存在的图标。某个品牌图标不存在时使用通用 code/browser/device 图标，不允许因为图标缺失让构建失败。

## 十、番剧、阅读、XP 和近况

### 9.1 番剧

当前唯一确认的喜欢番剧：

```text
想要成为影之实力者
The Eminence in Shadow
```

删除其余七个未经确认的番剧。不要为了填满网格保留它们，也不要生成新的番剧清单。

Fuyukawa 番剧卡片可使用已有 HOME 海报：

`/rain-dust/home/shadow-home-poster.jpg`

让数据支持显式 `image`，不要继续把 `engage-kiss.webp` 错当成《想要成为影之实力者》封面。

只有一项时正常展示一项，不显示“待补充”假卡片。

### 9.2 阅读

用户没有提供具体小说书名。不要编造书单或短评。

把默认 ME 中原本的“游戏 / GAMES / favoriteGames”区块改为“阅读 / READING”，保留该区块的位置、容器、动画和响应式，只替换内容语义。

真实条目：

```text
小说 / Novel
网文 / Web Fiction
玄学 / Metaphysics
```

建议把数据名称从 `favoriteGames` 改为 `favoriteReading`，同步更新全部引用。若大范围改名会增加无谓风险，也可以保留内部字段名，但所有可见标题、ARIA、图标和内容必须是阅读，最终报告中解释技术债。

不得继续显示：

- 赛博朋克 2077
- THE FINALS
- KovaaK's
- Aimlabs

原游戏封面不得拿来冒充阅读内容。保留原卡片外壳，用书本/文本类图标作为无封面降级，不创建新视觉系统。

### 9.3 XP

可以公开的真实审美偏好：

```text
白发 / white hair
红瞳 / red eyes
神秘感 / quiet mystery
赤足意象 / barefoot imagery
```

删除猫娘、粉毛、病娇、重女。

目前没有四张对应素材，不得继续使用 `xp-catgirl.webp` 等错误图片。保持原 XP 卡片容器和动效，使用已有图标或纯文字降级：

- 白发：sparkles
- 红瞳：eye
- 神秘感：moon-stars
- 赤足意象：footprints

先确认图标确实存在。不要生成白发少女图片，也不要从互联网随意抓图。

文案保持审美描述，不做性化扩写。

### 9.4 当前近况

替换为：

```text
正在做：完善这个个人网站。
最近在折腾：Earth Online、浮生录和一些小项目。
当前状态：Vibe Coding。
```

删除 UE5、AstrBot 和其他未经确认的学习/开发状态。

Blank/Kisara 不再生成公开 HOME，因此不为它们继续编写新的个人近况文案。

## 十一、ME 页面

公开的默认 ME 必须只读取 Rain_dust 的真实数据。

### 必须保留

- Fuyukawa 原版布局。
- 圆形网络头像。
- GitHub 和 Email。
- 技术线、番剧、XP、当前电波等原有展示位置。

### 必须替换

- 所有错误技术栈。
- 所有未经确认番剧。
- 所有上游 XP。
- 游戏区 → 阅读区。
- 所有 UE5、AstrBot、MMD、Unity、Blender 的个人经历文案。
- “二次元技术宅，兴趣驱动型折腾人……”等过长或像 AI 生成的个人介绍。

Fuyukawa README 使用：

```text
Hi, I am Rain_dust

INTP / 白羊座。
小说、网文、动漫、玄学都看一点。
想到什么，就做点什么。
```

不要在本批次重新实现真正 Markdown 驱动的 README，也不要重做书页 ME；这属于已关闭的旧架构方向。

## 十二、WORKS 页面

保留 Yuimi WORKS 的全部视觉和交互。当前五个项目与“更多项目”仍是唯一作品数据：

1. `https://github.com/Rain-dust/earth-online`
2. `https://github.com/Rain-dust/fushenglu`
3. `https://github.com/Rain-dust/MindCache`
4. `https://github.com/Rain-dust/campus-reimburse-kit`
5. `https://github.com/Rain-dust/Zhi-Wei`
6. `https://github.com/Rain-dust?tab=repositories`

### 必须处理

- 逐项核对当前简介、状态和 details 与仓库事实一致。
- 把内部 ID 从 `astrbot-lab`、`unity-toys`、`blender-props`、`ue5-room`、`mmd-camera`、`yuimi-web-lab` 换成真实、稳定的项目 ID：
  - `earth-online`
  - `fushenglu`
  - `mindcache`
  - `campus-reimburse-kit`
  - `zhi-wei`
  - `more-projects`
- 更新默认 Fuyukawa 中依赖这些 ID 的图标、accent、过滤器和展示映射。
- 把 Fuyukawa 中“Unity、Blender、UE5、MMD 和 AstrBot……”的旧介绍改为：

```text
这里不是严肃作品集，更像一张正在更新的技术收藏桌。
WebGL、PWA、Python、Next.js 和 JavaScript，都来自真实做过的小项目。
```

### 禁止

- 不改回塔罗牌。
- 不新增虚构项目。
- 不伪造 star、下载量、用户数或完成度。
- 不把“更多项目”写成一个真实产品。

## 十三、BLOG 清理

用户不要求持续写文章，目前允许零篇文章。现有 `src/content/blog/` 的 8 篇上游文章不得继续作为 Rain_dust 的文章展示。

### 执行

- 从目标生产内容集合删除这 8 篇上游文章。
- 相关上游内容仍存在于锁定参考仓库和 Git 历史，不额外复制到公开目录。
- 删除仅被这些文章引用、确认已无其他用途的 `public/blog-assets` 内容；删除前通过引用扫描给出证据。
- 不生成“欢迎来到我的博客”之类填充文章。
- 不把文章作者批量改成 Rain_dust。

### 零文章状态

默认 Fuyukawa BLOG 必须保持原主题结构，不得看起来构建失败。

统一中文：

```text
这里暂时没有文章。
有想写的再写。
```

可保留英文小标题：

```text
NO NOTES YET
```

处理零文章时：

- 列表区显示空状态。
- 搜索框可以禁用并显示“暂无文章”，或安全返回零结果。
- Pagefind 和本地回退不得抛异常。
- HOME 和其他默认页面不得继续展示上游文章预览。
- 删除文章后生成的旧 `/blog/<slug>/` 不应继续存在于新构建和 sitemap。
- 原文章旧 URL 应返回自定义 404；不重定向到假文章。

测试中使用的 `hello-asteria` 等示例 slug 改成中性、非生产依赖的 `example-note`。不要为了测试保留真实上游文章。

## 十四、哪些 Yuimi 内容不应机械替换

以下内容保留：

- 默认 `Fuyukawa Kagari` 主题名称。
- 上游源码 attribution、README、THIRD_PARTY 和历史报告中的 Yuimi 名称。
- `yuimi-*` localStorage、sessionStorage、事件名、全局变量和内部 data attribute；改名会破坏用户偏好兼容，没有可见收益。
- `astro.config.mjs` 中内部 integration 名称。
- 主题 CSS 类名、文件路径和实现注释。
- Fuyukawa 漫画背景、猪猪挂件、音乐播放器。
- 通用节日公告、历史条目和不声称属于作者个人经历的装饰文案。

这些属于上游来源或主题装饰，不冒充 Rain_dust 的个人事实。用户已经确认当前版本的发布权利。

Blank/Kisara 的源文件、资源、名称和历史说明可以留在仓库中作为未引用参考，但生产界面、导航、预取、sitemap 和页面构建不得暴露它们。

没有新的白发少女、小说封面和其他个人素材时，不生成、不抓取、不替换主题装饰；在最终报告中列入“未来可换素材”，但不能因此阻塞本批次。

## 十五、可见残留审计

源码和生产构建中搜索：

- Yuimi
- Yuimi-chaya
- 喝益胃
- Asteria / asteria
- Unity / Unity3D
- Blender
- UE5
- MMD
- AstrBot
- 猫娘
- 粉毛
- 病娇
- 重女
- 旧八部番剧
- 旧四个游戏
- 旧个人社交链接
- GAME / games

分类：

1. 可见且冒充个人资料：必须清除。
2. 主题名称或装饰：保留并记录。
3. attribution、文档和报告：保留。
4. 内部兼容标识：保留。
5. 删除文章后的死内容/死资源：清除。
6. Blank/Kisara 源码参考：可以保留，但任何可见入口、href、预取、route manifest 和生成 HTML 均必须清除。
7. Live2D/waifu：不属于可保留装饰；源码、DOM、样式、外部请求和 fallback 可见内容均必须从默认生产运行链路清除。

验收重点是浏览器可见文本和构建产物，不要求把技术内部的 `yuimi` 字符串清零。

另外扫描真实姓名、学校、专业、城市和年龄，确保没有新增泄露。

## 十六、SEO、元数据和社交预览

检查默认主题及核心路由：

- `<title>`
- meta description
- canonical URL
- Open Graph
- Twitter card
- sitemap
- JSON-LD（若存在）
- favicon 和 apple touch icon

对外身份统一为 Rain_dust / 寻辰沐雨 / Vibe Coder。社交预览优先使用现有 HOME poster 或头像，不使用上游作者头像。

默认页面可以保留 Fuyukawa 主题来源说明，但无需在普通页面标题中反复强调主题名。

## 十七、兼容、生命周期和回滚

- 不改变现有导航路由。
- `/works`、`/me` 兼容跳转继续工作。
- `/games/` 继续 404。
- `/themes/blank/*`、`/themes/kisara/*` 继续 404，不重定向。
- 旧主题 localStorage 偏好安全迁移为默认 Fuyukawa。
- HOME、BLOG、WORKS、ME 中均不应出现 Live2D/waifu DOM；旧 Live2D 状态不影响新版。
- 删除博客文章后，ClientRouter 进出 BLOG 不能残留搜索监听、Pagefind 状态或空 canvas。
- ME 数据条目数量减少后，默认主题不能依赖固定数组长度而报错。
- 内容高度变化后重新验证桌面和手机滚动边界。
- 部署失败时回滚 Sites `v21`，不要回滚到 v18，除非 v21 本身不可用。

## 十八、自动测试

至少完成：

- `npm ci`
- `npm test`
- Astro check
- `npm run build`
- Pagefind 构建
- 内部 HTML/CSS/媒体引用检查
- 全路由 HTTP 检查
- 密钥扫描
- 可见残留扫描

新增或更新测试：

1. `profileTech` 只包含真实五项。
2. `animeFavorites` 只包含《想要成为影之实力者》。
3. 阅读区包含小说、网文、玄学，不含旧四款游戏。
4. XP 只包含白发、红瞳、神秘感、赤足意象。
5. currentSignals 是本执行稿的三条真实近况。
6. 六个 WORKS 链接和真实 ID。
7. `src/content/blog` 零篇时默认主题正常构建。
8. Pagefind/本地搜索在零文章时不报错。
9. 旧 8 个文章 slug 不进入构建和 sitemap。
10. HOME 不再出现 `asteria@lab` 和旧 falling tags。
11. BUILD 产物的可见文本不再含错误个人资料。
12. 默认主题 ME、WORKS、BLOG 页面切换三轮无控制台错误和重复实例。
13. 导航、右键菜单、长按菜单和构建 HTML 中不存在 Blank/Kisara 入口。
14. `/themes/blank/*`、`/themes/kisara/*` 返回 HTTP 404。
15. sitemap、Pagefind、预取列表和 route manifest 中没有 Blank/Kisara URL。
16. 预先写入 `yuimi-theme-id-v1=blank` 或 `kisara` 后访问站点，会稳定落到 Fuyukawa 且不循环。
17. 构建产物不含 `data-live2d-*` 控件、`.waifu-local-fallback` 或看板娘提示文案。
18. 运行时不存在 `#waifu`、`#live2d`、`#waifu-tool`、`#waifu-toggle`、`#waifu-tips`。
19. 网络记录不再请求 `live2d-widgets`、`live2d_api` 或 Cubism Core。
20. TOOLS 抽屉和音乐播放器仍能打开、播放、暂停并跨路由保持状态。

不要为了这轮内容替换处理 22 项 npm audit 上游依赖告警。

## 十九、人工视觉验收

必须截取并检查默认 Fuyukawa 的 HOME、BLOG、WORKS、ME。
- 桌面 `1440×900`。
- 手机 `390×844`。

另外录制或连续截图：

- Fuyukawa HOME tag rain 中出现新标签。
- HOME 左下角不再出现角色、气泡或任何角色控制按钮，原区域自然露出背景。
- ME 在技术、番剧、XP、阅读和近况之间的完整浏览。
- BLOG 零文章状态。
- WORKS 六个链接与筛选。
- 右键、长按和顶部导航中均没有 Blank/Kisara。
- 直接访问旧主题 URL 得到默认自定义 404。

视觉验收：

- 不修改 Fuyukawa `theme.css`，除非零文章/无封面降级确实无法通过已有局部样式表达；任何 CSS 差异都必须逐行解释。
- 删除内容后不能留下大片像加载失败的空洞。
- 少量真实数据可以留白，不用假卡片填满。
- 手机端无横向溢出。
- HOME 视频、导航和音乐保持 v21 行为；主题切换与 Live2D/看板娘是本批次明确删除的两个全局功能。

## 二十、提交与发布

### 提交

建议拆成：

1. `content: replace inherited profile data with Rain_dust facts`
2. `content: remove inherited blog posts and add empty states`
3. `feat: remove Blank and Kisara public routes`
4. `feat: remove Live2D and waifu widget`
5. `test: verify Rain_dust content ownership pass`

实际文件耦合较强时可以合并，但最终报告必须按职责列出修改文件。

提交前：

- 工作区无无关改动。
- 构建产物和临时截图不误提交；需要保留的验收产物放入项目约定的 `artifacts`。
- 保留 `docs/RAIN_DUST_CONTENT_REPLACEMENT_EXECUTION.md` 作为执行依据。

### Sites 发布

本批次已授权在验证通过后发布：

- 复用 `.openai/hosting.json` 的现有项目 ID。
- 不创建新 Sites 项目。
- 用最终提交的精确源码状态重新构建。
- 推送精确源码状态后保存 Sites 版本。
- 只部署已保存版本。
- 部署非终态时持续检查。

### 生产验收

部署后在生产 URL 重跑：

- 四个核心路由。
- HOME 视频与新 tag rain。
- HOME 左下角无看板娘、Live2D、fallback 和控制按钮，网络无相关外部请求。
- BLOG 零文章。
- WORKS 六个链接。
- ME 全部新内容。
- `/works`、`/me`。
- `/games/`、Blank/Kisara 旧 URL、旧 8 个文章 URL和随机 404。
- 桌面和手机截图。
- 控制台和网络错误。

核心页面失败且不能立即安全修复时，回滚 Sites `v21`。

## 二十一、最终报告

最终回复先写结果，再列证据：

- 最终分支和提交。
- 新 Sites 版本、部署状态、生产 URL。
- 回滚版本。
- 删除的错误个人内容。
- 新的 Rain_dust 数据清单。
- 删除的 8 篇文章和零文章行为。
- 保留的主题/装饰 Yuimi 内容及理由。
- 删除的 Blank/Kisara 公开入口、路由与偏好迁移结果。
- 删除的 Live2D/看板娘 HTML、脚本、样式、资源和外部请求清单。
- 精确修改文件与职责。
- 自动测试结果。
- 默认四个页面的桌面/手机截图索引。
- HOME、ME、BLOG、WORKS 的人工验收结果。
- 生产可见残留扫描。
- 未处理的 22 项上游依赖告警。
- 仍等待用户提供的真实素材：
  - 更多番剧/小说具体标题与短评。
  - 白发红瞳少女素材。
  - XP 独立视觉素材。
  - 项目代表截图。

## 二十二、停止条件

只有同时满足以下条件才结束：

- 所有错误个人资料和上游文章已从生产可见内容清除。
- 默认 Fuyukawa 使用 Rain_dust 真实数据。
- Blank/Kisara 没有任何公开入口、生成页面、路径映射或 sitemap 记录。
- HOME 左下角 Live2D/看板娘及控制按钮已从实现和生产运行时完全移除，音乐 TOOLS 抽屉仍正常。
- 零文章 BLOG 正常。
- HOME、WORKS、ME 没有被重新设计。
- 测试、构建和视觉验收通过。
- 已创建提交并部署到现有 Sites 项目。
- 生产验收通过，或已明确回滚到 v21。

完成本批次后停止，不继续升级依赖、生成少女素材、改造 BLOG 或恢复塔罗 WORKS。
