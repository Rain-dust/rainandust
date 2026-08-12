# Rain_dust Portfolio 贵客松报名版：项目审计

> 审计日期：2026-08-03
> 审计范围：第一阶段，只读审计与基线验证；未修改页面、数据、样式、动画或部署配置。
> 当前分支：`codex/incremental-visual-tuning`
> 当前 HEAD：`ab37272 feat: refine portfolio visuals and ink transitions`

## 0. 审计结论

当前网站已经具备鲜明且难以替代的个人审美资产，也能证明作者有较强的前端实现、视觉调试和交互工程能力；问题不是“太有个人风格”，而是**审核者需要自己从风格中推断工程能力**。

目前 60 秒内最容易被看见的是二次元视觉、终端、动效与个性标签，最难被确认的是：

- Rain_dust 的工程身份；
- 三个代表项目分别解决了什么问题；
- 项目由谁完成、做到什么状态、能否继续落地；
- AI、自动化、交互式 Web 与 Creative Coding 能力对应哪些真实证据；
- 为什么适合贵客松，以及如何联系。

因此升级方向应当是**重排证据链，而不是去除人格**：保留当前动漫、终端、角色、页面色调和转场语言，将“身份 → 能力 → 项目证据 → 交付状态 → 贵客松动机”提到首屏和主路径；把兴趣信息移到审核者已经理解工程身份之后。

## 1. 当前权威快照

### 1.1 工作区状态

审计开始时工作区已有未提交修改，包括站点数据、HOME、BLOG、BaseLayout、主题样式、测试、Markdown 内容工作流和图片资源。本审计把这些修改视为当前真实版本，不覆盖、不撤销、不整理进提交。

仅公开主题仍为 `fuyukawa-kagari`。Blank/Kisara 源码或资源仍有非公开遗留，但没有注册为公开主题，也没有公开路由。

### 1.2 技术架构

| 项目 | 当前实现 | 审计判断 |
| --- | --- | --- |
| 框架 | Astro 6，静态输出 | 适合内容型作品集、SEO 和低运维部署，应保留 |
| 页面导航 | Astro `ClientRouter` | 可继续承载页间转场，不需要自建路由 |
| 内容 | Astro Content Collections + Markdown | 已具备“本地写作、访客只读”的正确基础 |
| 搜索 | Pagefind 构建期索引 | 适合 Engineering Notes，应保留 |
| 图标 | `astro-icon` + Iconify | 无需引入 UI 框架 |
| 图片处理 | `sharp` 脚本存在 | 能力存在，但没有纳入默认正式构建的完整优化链 |
| 动画 | CSS、页面脚本、Canvas/WebGL 开发原型 | 辨识度高，但生命周期和生产接入需要收束 |
| 测试 | Node Test + Astro Check | 已覆盖事实归属、公开路由、主题、转场/影墨原型边界 |
| 依赖策略 | 无 GSAP、Three.js UI 依赖或大型组件库 | 当前站点本身较轻，视觉复杂度主要来自自有 CSS、脚本和媒体 |

### 1.3 公开路由

| 路由 | 当前职责 | 缺口 |
| --- | --- | --- |
| `/` | 动漫视频 Hero、终端身份卡、GitHub/Email | 缺少 Creative Engineer 定位、代表作品、贵客松 CTA 与能力状态 |
| `/projects/` | 五个真实项目 + GitHub Archive | 只有索引，没有统一项目档案页、角色、截图、Demo 和技术决策 |
| `/blog/` | 灰色调阅读档案、搜索、文章列表 | 只有一篇文章，尚未形成“Engineering Notes → 项目证据”关系 |
| `/blog/[...slug]/` | Markdown 文章、目录、代码块 | 文章排版基础已经存在，可扩展项目关联元数据 |
| `/about/` | 身份、技能、动漫/兴趣、当前动态 | 个性完整，但工程身份和项目证据被技能墙、兴趣卡片稀释 |
| `/works` | 301 到 `/projects/` | 兼容路由，应保留 |
| `/me` | 301 到 `/about/` | 兼容路由，应保留 |
| `/404` | 自定义 404 | 应保留 |

当前没有 `/hackathon`、`/contact` 和 `/projects/[slug]`。

### 1.4 主题与页面组成

主题注册表只公开 `fuyukawa-kagari`，这是一个优点：后续不应新建第二套站点或第二套导航。`BaseLayout.astro` 已统一负责：

- SEO 基础信息与 canonical；
- `ClientRouter`；
- 全站导航和 Footer；
- 页面色调 `paper / architecture / editorial / profile`；
- 性能档位、主题偏好、控制台彩蛋；
- 右键菜单、樱花雨、滚动进度角色；
- 音乐运行时；
- 开发环境下的影墨和页间转场原型。

页面色调已经提供一套可扩展的“同站点、不同页面气质”骨架，符合贵客松版“不推翻设计”的原则。问题在于 `BaseLayout.astro` 同时承担太多全局运行逻辑，任何导航、转场或媒体改动都容易产生跨页回归。

## 2. 数据与证据链审计

### 2.1 站点身份

`src/lib/site.ts` 当前仍使用：

- 标题：`Rain_dust | Vibe Coder`；
- 描述：以 Vibe Coder、想法、代码与动漫为主；
- 导航：`HOME / BLOG / WORKS / ME`。

`src/core/data/profile.ts` 也把 `Vibe Coder` 放在身份层。它可以作为人格标签继续存在，但目前会覆盖更重要的工程定位。贵客松版需要把权威身份改为：

- `Rain_dust`；
- `Creative Engineer / Independent Builder`；
- “把模糊想法快速构建成可运行原型的独立开发者。”

这属于信息层级调整，不要求删除 Vibe Coder、INTP、动漫、游戏或设计偏好。

### 2.2 项目数据

当前 `projectEntries` 记录了五个真实项目和一个 GitHub Archive：

1. Earth Online；
2. 浮生录；
3. MindCache；
4. Campus Reimburse Kit；
5. Zhi-Wei；
6. more-projects（仓库索引）。

已有字段只有 `id / title / type / url / line / status / summary / details`。它足以生成仓库索引，但不足以生成黑客松审核需要的项目证据。缺少：

- 项目截图、封面、GIF、视频或 Demo URL；
- 真实问题和目标用户；
- 个人/团队属性、Rain_dust 的角色和负责范围；
- 三个关键技术选择及原因；
- 挑战、解决过程、结果和下一步；
- 可统一展示且有证据支持的 `Prototype / Running / Maintaining`；
- 项目关联的 Engineering Notes。

首页第三个代表项目建议优先审计 **Zhi-Wei**：现有数据明确出现 Next.js、TypeScript 和 OpenAI-compatible API，比浮生录更贴近 AI 黑客松方向。但在详情证据补齐前，不能把“使用兼容 API”扩大描述为已完成的 AI 产品能力，也不能虚构 Demo、用户量或团队角色。

### 2.3 技能数据

About 当前展示 Three.js/WebGL、Python、Next.js/React、SolidWorks、Creo、AutoCAD、拓竹 3D 打印、OpenCV 和 YOLO。这些技术本身真实且有辨识度，但当前是并列技能墙：

- 审核者无法分辨“项目中用过”“熟练掌握”“正在学习”；
- 没有从技能直接跳转到对应项目证据；
- 工业建模、机器视觉、Web 与 AI 的组合优势没有被解释。

后续应改成“能力 → 项目证据”，无公开证据的内容放入 `Used Before`，而不是直接删除。

### 2.4 Blog / Engineering Notes

内容集合已经支持 Markdown、GFM、代码块、目录、封面、标签、分类和草稿；`docs/BLOG_WRITING.md` 与文章生成脚本也已建立“本地/Codex 写作，公开站点只读”的正确权限边界。

当前只存在一篇作者自有文章，且 frontmatter 没有项目关联字段。将 Blog 改名为 Engineering Notes 不需要更换内容系统，只需要：

- 导航和页面命名调整；
- 为文章增加可选的 `relatedProject` 或等价字段；
- 在项目详情页反向展示关联笔记；
- 用真实开发记录逐步建立可信度，不能为填充页面制造假文章。

## 3. 样式与动画系统审计

### 3.1 规模

| 文件 | 规模 |
| --- | ---: |
| `theme.css` | 5,275 行 / 115,269 bytes |
| `HomePage.astro` | 1,278 行 / 48,486 bytes |
| `AboutPage.astro` | 815 行 / 21,758 bytes |
| `BaseLayout.astro` | 678 行 / 28,576 bytes |
| `ProjectsPage.astro` | 659 行 / 18,547 bytes |
| `BlogIndexPage.astro` | 590 行 / 17,004 bytes |

当前页面大量把 markup、页面 CSS 和生命周期脚本放在同一文件中；全局 CSS 又同时保存多轮视觉遗留。这不会立即造成构建失败，但会提高以下风险：

- 一个页面调整意外影响其他页面；
- Astro 客户端换页后监听器或状态没有正确重入；
- 桌面正常、跨页或移动端失配；
- 审核版新增信息时继续堆叠样式，难以维持视觉一致性。

后续不必大规模重构，但应在每个阶段按真实边界抽出可复用的“项目证据”“CTA”“能力证明”等小组件，并保持唯一导航数据源。

### 3.2 当前导航

桌面导航仍通过 `.site-header { top: -78px }` 隐藏，只有 hover 或键盘 focus-within 时展开。它保留了有趣的感应机制，但与“60 秒审核、永久可发现”直接冲突。移动端仍是普通链接网格，不是带 `aria-expanded` 的真实菜单按钮。

后续需要保留展开动画和每页材质差异，但把可发现性从 hover 中解耦；导航名称需要覆盖 `HOME / PROJECTS / NOTES / ABOUT / CONTACT`。

### 3.3 动画与生命周期

已有值得保留的基础：

- `ClientRouter`；
- reduced-motion 与性能档位；
- Projects 建筑暗光跟随；
- 影墨 WebGL 调试引擎；
- 四个页面色调的方向性转场原型；
- 多处 `AbortController` 和 `astro:before-swap` 清理。

但影墨和页间转场目前通过 `import.meta.env.DEV` 挂载，**正式构建不会包含这些开发原型**。贵客松版不能把本地调试效果当作线上既有能力；必须经过参数收束、生产接入、移动端/reduced-motion 降级和三轮换页重入验证后，才可列为正式体验。

HOME 还保留两段已经没有对应 DOM 的公告和标签雨脚本。它们会因选择器缺失而提前返回，因此当前不会继续请求定位/天气或运行 Canvas，但属于明确的遗留维护负担。Hero 视频、终端输入、头像互动和媒体清理仍在运行。

### 3.4 全局装饰与彩蛋

樱花雨、滚动进度角色、自定义右键菜单、终端、控制台彩蛋和页面色调共同构成个人站气质。它们不应被“一键企业化”。需要调整的是作用范围：

- 审核首屏不能被装饰抢走身份与 CTA；
- 阅读长文和项目案例时，持续装饰不能影响正文可读性；
- 自定义右键菜单不应阻碍常规浏览器操作；
- 音乐运行时如果没有公开入口，不应持续承担正式产物和维护成本；
- 每项动效都应有 reduced-motion 与移动端降级。

## 4. 资源、性能与部署审计

### 4.1 资源体积

当前 `public/` 共约 **155.14 MB**：

| 类型 | 文件数 | 体积 |
| --- | ---: | ---: |
| MP3 | 22 | 65.50 MB |
| PNG | 24 | 63.13 MB |
| JPG | 14 | 11.85 MB |
| WebP | 69 | 10.37 MB |
| MP4 | 2 | 3.20 MB |
| GIF | 2 | 0.82 MB |

当前正式构建产物 `dist/client` 为 **70 个文件 / 51.38 MB**。其中九首音乐约 33 MB；最大单图为 `fuyukawa-kagari-bg.png`（5.94 MB），Hero 壁纸 PNG 为 2.38 MB，HOME 视频约 1.13 MB。

这意味着性能优化不能只做代码拆分。优先级应为：

1. 明确音乐是否继续进入首屏/正式包；
2. 让大 PNG 使用已生成的 WebP/AVIF 或合理尺寸版本；
3. 为项目截图建立统一导出尺寸和响应式格式；
4. 检查视频 poster、预加载和首屏网络优先级；
5. 清理未公开主题和仅历史验收需要的构建资源，而不是删除源码历史。

`optimize-images.mjs` 已存在，但默认 `npm run build` 只执行 `generate:assets`，没有自动执行全量图片优化。后续需要先区分“源素材”和“站点投放资产”，避免构建时反复处理或覆盖用户原图。

### 4.2 部署路径

当前存在三套部署信号：

- Astro `site` 指向 ChatGPT Sites 域名；
- `prepare-sites.mjs` 生成 `dist/server`、`dist/.openai` 并打包 Sites worker；
- GitHub Actions 使用 GitHub Pages，并上传整个 `dist`；
- `edgeone.json` 还包含另一套缓存配置。

风险点：

- Astro 页面根在 `dist/client`，而 GitHub Pages workflow 上传 `dist`，需要真实验证 Pages 的 artifact 根目录是否正确；
- `edgeone.json` 当前末项带尾随逗号，不是严格 JSON；
- README、Astro `site` 与实际生产平台需要统一；
- 本轮不能修改 `.openai/hosting.json`，也不应在审计阶段发布。

### 4.3 第三方与授权

`THIRD_PARTY.md` 记录了 Yuimi 上游锁定提交，但同时出现“主题源码/图片/音乐许可未确认”和“站点所有者已确认公开发布权”两种表述。这里需要在正式贵客松报名版发布前形成清晰的逐项授权结论。

最需要优先确认的是：

- 动漫/角色图片是否允许公开再发布；
- 九首音乐是否具备网络传播权；
- Yuimi 主题实现的复制、修改和再发布授权；
- 项目截图和博客插图的来源、署名与使用范围。

审计不替代法律判断，也不能用“个人站”自动推定素材可公开传播。

## 5. 当前优势

1. **辨识度高。** 动漫画面、终端、角色互动、页面材质和水墨/影幕方向，比普通卡片式作品集更容易被记住。
2. **已经有真实项目数据。** 五个仓库和 GitHub Archive 由单一数据源生成，并有测试防止假项目和错误 URL。
3. **工程底座合适。** Astro 静态输出、Content Collections、Pagefind、ClientRouter、reduced-motion 和静态 404 都适合作品集。
4. **有跨页面视觉系统雏形。** paper、architecture、editorial、profile 四种色调允许每页不同，又能共享同一导航和转场逻辑。
5. **交互实现能力可见。** HOME 视频生命周期、Projects 光影、影墨 WebGL 原型和客户端重入修复都能证明不是纯模板拼装。
6. **内容归属意识已经建立。** 测试明确禁止假文章、Live2D/waifu、GAME 和未公开主题重新进入生产路由。
7. **本地 Markdown 写作流程正确。** 作者在仓库内写作，发布后访客只读，不需要把 CMS 权限问题带进报名版。

## 6. 当前阻碍审核的问题

按对“60 秒理解”的影响排序：

### P0：身份和目的不够直接

首屏仍以 `Personal site / Anime & code` 和 Vibe Coder 为主要信号，没有 Creative Engineer、核心介绍、代表作品 CTA 或贵州贵客松任务状态。审核者知道“这个人很有风格”，但不能立刻知道“这个人能快速交付什么”。

### P0：项目是仓库索引，不是交付证据

Projects 能证明项目存在，却不能证明决策过程、个人角色、完成状态和继续落地能力。没有 Case 路由时，“View Case”也无处可去。

### P0：缺少贵客松专用叙事

没有 `/hackathon`，无法在一个短页面内回答 About Me、Why Hackathon、Representative Projects、Skills、Team Availability 和 Contact。

### P1：能力与证据断开

技能墙列出了很多技术，但没有指向 Earth Online、Campus Reimburse Kit、Zhi-Wei 等真实证明。对审核者而言，技能数量越多，越需要证据分级。

### P1：导航隐藏且名称偏个人站

桌面导航依赖顶部 hover，移动端没有明确菜单 button；`BLOG / WORKS / ME` 也没有直接表达 Engineering Notes、Projects、About 和 Contact。

### P1：About 的工程身份顺序靠后

兴趣、审美和状态都值得保留，但需要在“工程身份 → 能力 → 项目证明”之后进入 After Hours / Personal。

### P1：Notes 尚未成为可信度网络

只有一篇长文，且没有项目关联。Engineering Notes 应逐步记录真实技术决策和失败案例，不能通过生成空洞文章快速填满。

### P2：全局运行逻辑和资源预算偏重

115 KB 全局 CSS、过大的页面组件、33 MB 正式音乐、多个全局装饰和遗留脚本，会增加移动端、跨页生命周期和 Lighthouse 风险。

### P2：部署与授权边界不够单一

Sites、GitHub Pages、EdgeOne 信号并存，授权文档内部仍有歧义。报名页可以先本地完成，但正式公开前必须收口。

## 7. 设计资产分类

### A. 核心资产：必须保留并强化

| 资产 | 保留原因 | 贵客松版使用方式 |
| --- | --- | --- |
| Rain_dust 品牌与动漫主视觉 | 形成独特记忆，不应被普通技术模板取代 | Hero 继续作为第一视觉，但让工程身份和 CTA 同屏出现 |
| 终端语言与身份卡 | 同时表达开发者身份和个人气质 | 改写终端内容为能力、状态和 Current Mission，不删除终端 |
| HOME 视频、角色、轻互动 | 真实视觉资产和互动工程证明 | 保留媒体生命周期，控制其不遮挡信息 |
| 四类页面色调 | 已解决“同站点不同页面气质”的结构问题 | HOME 纸面、Projects 建筑暗色、Notes 灰色编辑、About 个人档案继续区分 |
| Astro `ClientRouter` 与方向性转场思路 | 可以把风格跨度转化为体验资产 | 从 DEV 原型收束为可降级的生产转场，不另造路由 |
| 五个真实项目与 GitHub URL | 审核可信度的事实底座 | 扩展字段和 Case 页面，不改项目事实 |
| Markdown + Pagefind | Engineering Notes 的可靠内容底座 | 增加项目关联，不引入公开编辑器 |
| INTP、动漫、游戏、设计偏好 | 构成个人审美和团队气质 | 放到 About 的 After Hours / Personal，不删除 |

### B. 可以调整位置或作用范围

| 资产 | 当前问题 | 建议位置 |
| --- | --- | --- |
| Vibe Coder | 当前像正式职业定位 | 降为 Hero/About 的人格标签 |
| GitHub / Email | HOME 已有，但缺少任务导向 | 保留并补入 CTA、Contact、Hackathon |
| About 兴趣卡片 | 先于工程证据造成主次倒置 | 移到工程身份、能力和项目证明之后 |
| 滚动进度角色 | 有趣但全站持续抢占边缘视觉 | 保留为轻量进度反馈，针对案例页/移动端调低存在感 |
| 自定义右键菜单和控制台彩蛋 | 有个人感，但可能影响标准操作 | 作为非关键彩蛋，不能阻碍复制、打开链接和无障碍操作 |
| 樱花雨 | 增加气氛，但长文与暗色页面未必适合 | 按页面色调和性能档位启用，而非全站同强度 |
| Projects 建筑光影/影墨 | 可以证明 Creative Coding，但当前原型或弱可见 | 作为项目页的材质层，不能吞没正文和点击区域 |
| 个人动态 | 有温度，但不是首要交付证据 | About 后段或 Hackathon 的 availability 小节 |

### C. 应该弱化或收束，不等于直接删除

| 资产/实现 | 原因 | 收束方式 |
| --- | --- | --- |
| 顶部隐藏导航 | 审核者可能根本发现不了 | 导航永久可见，保留材质变化和微动画 |
| 大量并列技能卡 | 无项目证据时可信度有限 | 改为能力 → 项目，剩余技术进入 Used Before |
| 无入口的音乐运行时与完整音乐包 | 约 33 MB，且有传播权风险 | 在确认产品价值和授权后再决定按需加载或移出正式包 |
| HOME 无 DOM 的公告/标签雨脚本 | 已成为死分支，增加维护成本 | 在后续触及 HOME 生命周期时删除死代码，不恢复旧 UI |
| 全局持续装饰 | 可能与长文、Case Study、移动端竞争注意力 | 按页面、设备、reduced-motion 控制强度 |
| 多平台部署配置并存 | 难以判断哪个是生产真相 | 发布前指定唯一权威部署路径，其余标为历史或专用配置 |

## 8. 必须修改的问题

以下是后续阶段的最小必要改动，不在本审计阶段实施：

1. 建立唯一的品牌定位数据：Creative Engineer / Independent Builder，Vibe Coder 仅作标签。
2. 重排 HOME 首屏信息，使身份、能力、Current Mission 和三个 CTA 无需滚动即可看到。
3. 增加 HOME 的三项 Selected Projects，建议 Earth Online、Campus Reimburse Kit、Zhi-Wei；所有状态和角色必须有事实依据。
4. 扩展项目数据模型，并建立统一 `/projects/[slug]` 档案模板。
5. 增加 `/hackathon`，直接服务贵客松报名，不做普通简历页。
6. 把导航改为永久可发现的五项结构，并实现可访问的移动端 button。
7. 重排 About：工程身份 → 能力 → 项目证明 → After Hours / Personal。
8. 把技能墙改为证据映射，未证明技能进入 Used Before。
9. 将 Blog 命名与叙事调整为 Engineering Notes，并增加项目关联。
10. 把开发转场原型收束为可生产、可降级、可重入的页间体验。
11. 建立正式媒体预算和投放格式，优先处理音乐与大 PNG。
12. 统一部署真相并解决素材授权歧义，再进行公开发布。

## 9. 修改风险与控制方式

| 风险 | 可能结果 | 控制方式 |
| --- | --- | --- |
| 在脏工作区大改 | 覆盖用户已验收的视觉调整 | 每阶段只改明确区域；开始前记录 diff；不使用破坏性 reset |
| 为报名效果虚构项目事实 | 降低可信度 | 角色、状态、Demo、用户和结果必须来自仓库或用户确认 |
| 首页塞入过多审核信息 | 破坏主视觉和首屏呼吸感 | 使用现有终端与视觉语言承载信息，不增加普通仪表盘 |
| 新 Case 页面复制项目数据 | 后续内容漂移 | 项目索引、首页精选和 Case 共用唯一数据模型 |
| 抽组件过度 | 小项目复杂度失控 | 只抽出现两次以上或有独立生命周期的边界 |
| 转场接入生产后重入失效 | 只在首次跳转可见、后续卡顿 | 用持久控制器、单实例、三轮导航、reduced-motion 和移动端验证 |
| 动效影响可读性/性能 | Lighthouse 与审核体验下降 | 信息层在动效之上；限制 Canvas；按设备降级；保留静态视觉 |
| 图片与音乐权利不清 | 无法安全公开报名页 | 逐项建立来源和授权表；未知资源不上生产 |
| GitHub Pages / Sites 路径不一致 | 本地成功、线上路径错误 | 发布前对唯一目标平台跑真实预览和 404/资源路径验证 |
| 一次完成十二阶段 | 难以视觉验收和回退 | 保持阶段 checkpoint；每阶段测试、浏览器验收后再继续 |

## 10. 第一阶段基线验证

| 验证 | 结果 |
| --- | --- |
| `npm.cmd test` | 36/36 通过，0 failed |
| `npm.cmd run check` | 48 files，0 errors |
| `npm.cmd run build` | 成功，静态生成 8 pages，Pagefind 索引 8 pages |
| 构建警告 | Vite 生成一个空的 `BaseLayout...` chunk；不阻断构建，但后续可清理 |
| 正式产物 | `dist/client`：70 files / 51.38 MB |

本阶段没有运行 Lighthouse，因此不能声称已经达到 Performance > 85 或 Accessibility > 90。Lighthouse 应在功能与媒体结构稳定后，使用桌面和 390px 移动端分别验收。

## 11. 建议的执行门槛

在进入第二阶段前，建议确认以下原则：

1. 接受“重排证据链，不去人格化”的总方向；
2. 接受 Zhi-Wei 作为第三个候选代表项目，但在实现前补齐真实角色、状态、截图和 Demo 信息；
3. 接受项目档案、Hackathon 页面和 Engineering Notes 共用结构化数据，而不是手写三份重复内容；
4. 在发布前单独完成媒体授权与唯一部署平台确认；
5. 每个阶段独立修改、测试和浏览器验收，不一次性重写全站。

确认本审计后，下一阶段应只完成品牌定位和信息架构定义；不应直接跳到全页面重构。
