# Yuimi 完整移植交接稿

版本：Batch 0 / 执行基线  
目标项目：`rain-dust-portfolio`  
目标站点：`https://rain-dust-portfolio.workspace-852244.chatgpt.site/`

## 给下一位 Codex 的直接指令

你现在接手 `rain-dust-portfolio`。停止延续当前站点的自创设计，也不要再“参考”“借鉴”或用自己的组件做近似复刻。

以 Yuimi-chaya 的源码为唯一界面与交互标准，进行完整、忠实的源码级移植：

- 上游仓库：`https://github.com/Yuimi-chaya/Yuimi-chaya.github.io`
- 上游网站：`https://yuimi-chaya.github.io/`
- 已准备的本地只读参考副本：`D:/Users/Documents/个人作品集/yuimi-chaya-reference`
- 锁定上游提交：`6b1dc0199d1fb824081f777c5f798ac933e8a94c`
- 当前目标项目副本：`D:/Users/Documents/个人作品集/rain-dust-portfolio`
- 当前目标项目正式目录：`C:/Users/Administrator/Documents/Codex/2026-07-25/zhe/work/rain-dust-portfolio`
- 当前目标项目基线提交：`8cb81ccc7aa41e0c6a49caa5d419f8321cfd294d`

“完整移植”的含义是：直接采用上游的目录结构、页面结构、DOM、样式、断点、动画、状态逻辑、全局挂件和交互脚本；不要重新设计，不要用现有站点的实现去模仿。只修改本交接稿明确列出的内容。未列入替换清单的上游内容，在授权允许的前提下保持原样。

唯一已经拍板的结构例外：全站删除 `GAME` 导航入口和游戏页。不要擅自增加其他结构差异。

## 一、开始前检查

执行前先做只读检查并给出一个极短计划，然后直接实施：

1. 确认两个仓库的实际路径、HEAD 和工作区状态。
2. 对目标项目运行 `git diff --name-only`、`git diff --check`，不要只凭 `git status` 判断是否存在真实差异。
3. 确认本地上游副本仍位于锁定提交 `6b1dc01`，且没有本地修改。
4. 阅读上游 `README.md`、`package.json`、`astro.config.mjs`、`src/core/themes/registry.ts`、默认主题全部页面和 `BaseLayout.astro`。
5. 先建立可恢复基线，例如分支 `codex/pre-yuimi-exact-port-v18`；不要用 `reset --hard` 或覆盖尚未核对的用户文件。
6. 记录目标项目现有 Sites 部署桥接文件，移植时必须保留部署身份：
   - `.openai/hosting.json`
   - `worker/index.js`
   - `scripts/prepare-sites.mjs`

## 二、发布前的权利与安全门槛

上游仓库在锁定提交的根目录中没有发现 `LICENSE` 文件。公开可见的仓库不自动等于允许复制和再发布。因此：

1. 可以先完成本地移植与视觉验收。
2. 在公开部署前，必须由用户确认已得到作者许可，或补充能够覆盖源码复制、素材和再发布的许可证依据。
3. 保留必要的上游作者与来源说明，不得把上游文章或原创素材伪装成 Rain_dust 的原创。
4. 单独审查上游的动漫图片、音乐、Live2D、字体等第三方素材；源码作者的许可不一定覆盖这些素材。
5. 不得复制上游源码中出现的地图、天气或其他服务密钥。改用 Rain_dust 自己的环境变量/密钥；没有密钥时保留原版视觉结构并走原版降级状态。

如果授权尚未确认，不要部署生产站点；把本地构建、差异报告和截图交给用户即可。这个门槛不允许为了“完全照搬”而绕过。

## 三、唯一目标

让 Rain_dust 的站点在页面构成、空间关系、响应式布局、视觉效果和交互行为上，与锁定提交对应的 Yuimi 站点一致；用户一眼看到的应当是“Yuimi 原站换成了 Rain_dust 的身份与已提供素材”，而不是“另一个受 Yuimi 启发的网站”。

## 四、不可违反的实现原则

- 上游源码是唯一事实来源，截图只用于验收，不用于重新猜测实现。
- 优先复制文件和保留代码路径，不重写同等功能。
- 不重画 `theme.css`，不重新调一套“差不多”的颜色、阴影、圆角或玻璃效果。
- 不简化动画、挂件、右键菜单、音乐状态、主题系统、页面过渡和清理逻辑。
- 不将原版桌面布局改造成普通纵向落地页。
- 不用当前项目已有的自创 HOME、终端卡片或 ME 页面混搭上游结构。
- 不为“代码更干净”提前重构上游；先忠实移植，再在视觉验收通过后讨论维护性。
- 未列出的替换项保持上游原样；任何不得不修改的地方都必须进入最终差异清单。

## 五、移植范围

完整移植上游仓库，包括：

- Astro 6 项目结构、依赖与构建逻辑。
- `src/core` 的主题注册、数据结构与共用逻辑。
- `src/themes/fuyukawa-kagari` 默认主题的全部布局、页面、样式和脚本。
- `blank` 与 `kisara` 两套主题以及原版主题切换机制。
- `public/themes` 中与主题相关的公开资源。
- 博客内容集合、Markdown 管线、Pagefind、站点地图、图标系统和 Expressive Code。
- 原版页面过渡、预取、localStorage/sessionStorage 状态和事件清理。
- 原版 404、页脚、主题菜单、音乐播放器、Live2D/降级形象、工具栏、樱花、滚动条等全局细节。

以下是必要的目标站点适配，不属于重新设计：

- 保留现有 Sites 项目 ID 和部署桥接。
- `astro.config.mjs` 继续使用上游全部集成，同时把 `site` 改为目标生产地址，并让输出兼容 `dist/client`。
- 构建完成后继续运行 `scripts/prepare-sites.mjs`，使 `dist/server`、`dist/.openai` 和静态资源满足当前 Sites 部署。
- 不重新创建 Sites 项目，不替换 `.openai/hosting.json` 中的项目 ID。

## 六、导航和路由

主导航最终只有：

- `HOME` → `/`
- `BLOG` → `/blog/`
- `WORKS` → `/projects/`
- `ME` → `/about/`

要求：

- 从默认主题、Blank、Kisara 和所有移动端/浮层入口中移除 `GAME`。
- 删除或禁用 `/games/` 页面，不留下可见死入口。
- 为旧地址增加兼容跳转：
  - `/works`、`/works/` → `/projects/`
  - `/me`、`/me/` → `/about/`
- 除删除 GAME 外，不调整上游导航的外观、弹出方式、布局、动画或响应式行为。

## 七、允许替换的身份和素材

### 7.1 公开身份

| 字段 | 替换值 |
| --- | --- |
| 中文网名 | 寻辰沐雨 |
| 英文网名 / 品牌名 | Rain_dust |
| 身份描述 | Vibe Coder |
| 人格与星座 | INTP / 白羊座 |
| 兴趣 | 小说、网文、动漫、玄学，以及其他广泛兴趣 |
| GitHub | `https://github.com/Rain-dust` |
| Email | `1223451146@qq.com` |

禁止公开真实姓名、学校、专业和所在城市。

文案必须短、自然，避免 AI 腔。可直接使用：

> INTP / 白羊座  
> 小说、动漫、玄学，什么都看一点。  
> 偶尔把脑洞做成东西。

### 7.2 头像

- 原始文件：`D:/Users/Downloads/com.tencent.mm_20260728202729.jpg`
- 当前项目内副本：`public/rain-dust/me/rain-dust-avatar.jpg`
- 保持上游头像组件的尺寸、圆形裁切、边框、装饰物、悬停和点击反馈。
- 只换图片，不另做一套头像外框。

### 7.3 HOME 动态素材

- 原视频：`D:/Users/Downloads/share_3de1e6fb06261295e9deb444338b3ca917852458376.mp4`
- 当前 0–10 秒循环版：`public/rain-dust/home/shadow-home-loop.mp4`
- 当前海报：`public/rain-dust/home/shadow-home-poster.jpg`

把这段视频作为 Rain_dust 的 HOME 素材替换项，但仍由上游 HOME 的舞台结构、遮罩、内容层级、滚动联动和性能策略控制。要求：

- 自动播放、静音、内联播放、循环。
- 使用前 10 秒，不使用结尾片段。
- 不通过过度放大遮盖画面；按上游舞台的容器与响应式逻辑适配。
- 海报仅用于加载和低性能降级，不能让正常状态停成静态图。
- 保留 `prefers-reduced-motion`、低性能模式和资源失败时的上游降级行为。

如果视频替换与上游原 HOME 静态背景的精确层级发生冲突，只允许增加一个位于原背景层的 `<video>` 媒体层；其余 DOM、装饰、内容和交互保持上游不变。

### 7.4 HOME 和 ME 中的名字

保留上游终端、打字机和资料卡的结构与动画，仅把身份文本换成 Rain_dust：

- 主品牌与英文标题：`Rain_dust`
- 中文署名：`寻辰沐雨`
- 角色：`Vibe Coder`
- GitHub 按钮替换为 Rain_dust GitHub。
- Bilibili 等未提供的个人账号入口替换为 Email；按钮尺寸和原版样式不变。

除上述明确文本外，终端窗口的布局、光标、标题栏、打字节奏和交互保持原版。

## 八、作品数据

已确认的作品：

1. `https://github.com/Rain-dust/earth-online`
2. `https://github.com/Rain-dust/fushenglu`
3. `https://github.com/Rain-dust/MindCache`
4. `https://github.com/Rain-dust/campus-reimburse-kit`
5. `https://github.com/Rain-dust/Zhi-Wei`

执行要求：

- 保持上游 WORKS 页的 hero、技术轨道、过滤器、技术线面板、作品卡片和展开状态原样。
- 只替换 `src/core/data/projects.ts` 的作品数据，不把作品区改回塔罗牌或当前项目的自创卡片。
- 逐个读取这些仓库的 README、语言、依赖和实际功能后填写简介与技术栈，禁止凭项目名编造。
- 如果上游布局需要第六项，而用户尚未提供第六个项目，可用一个“更多项目”入口指向 `https://github.com/Rain-dust?tab=repositories`；不要冒充一个不存在的项目。
- 点击行为、展开行为、过滤状态和卡片动画完全沿用上游。

## 九、BLOG 与未提供内容

用户明确认为网站不依赖持续写作，BLOG 可以存在，但不应被提前抬成首页主角。

按照“未替换保持原样”的指令，BLOG 的页面结构、搜索、时间线和文章渲染应完整保留。文章内容则受权利边界约束：

- 若用户已获得许可，保留上游文章并明确来源/作者。
- 若没有许可，不要把上游文章以 Rain_dust 名义发布。可以在本地保留用于结构验证，但生产部署前必须停止并报告。
- 不要凭空替 Rain_dust 生成作品文章。

## 十、ME 页

ME 必须完整采用上游 `AboutPage.astro` 原架构：

- 左侧粘性资料栏、圆形头像、身份、状态。
- 右侧 README hero。
- 技术栈网格。
- 喜欢的番剧。
- XP 与游戏/兴趣分区。
- 最近在做什么。

只替换已经明确的信息。尚未提供的具体番剧清单、小说清单、技术栈和 XP 条目先保持上游原样，并在最终报告中列为“等待用户替换的上游占位内容”，不要自行脑补。

目前唯一明确喜欢的番剧是《想要成为影之实力者》，可替换上游番剧列表中的第一项；其余项保持原样直到用户补充。

## 十一、必须原样保留的功能

### 全局

- 默认主题 Fuyukawa Kagari 的完整样式。
- 主题注册、主题偏好记忆与长按主题菜单。
- Astro ClientRouter 和页面切换后的重新初始化/清理。
- 顶部浮动导航的原版出现方式、选中态和响应式。
- 左侧工具栏、猪猪滚动条、樱花效果。
- Live2D 控制、加载失败与静态降级。
- 音乐播放器、播放状态和持久化。
- 自定义右键菜单。
- 页脚计时与原版装饰。
- 控制台彩蛋。

### HOME

- 日常公告弹窗、当天不再显示和 session 行为。
- 原版 hero 舞台和中央品牌信息。
- 打字机终端。
- 头像与 profile terminal。
- scroll cue、scene divider。
- tag rain canvas。
- 本地日期、时间、天气/位置状态及失败降级。
- 滚动驱动的 hero/profile docking。
- 头像 poke 反馈。
- 页面重入时的完整清理逻辑。

### BLOG

- Pagefind 搜索及本地回退。
- 时间线和紧凑列表。
- 文章页、目录、代码块和 Markdown 渲染。

### WORKS

- hero、技术 orbit、过滤器、tech line board。
- 项目网格和展开状态。

### ME

- 上游全部布局、区块和响应式。

## 十二、文件责任边界

移植时以这些上游文件为主要事实来源：

- `src/themes/fuyukawa-kagari/layouts/BaseLayout.astro`：全局交互和挂件。
- `src/themes/fuyukawa-kagari/styles/theme.css`：默认主题全部视觉；除资源 URL 的必要适配外应保持哈希一致。
- `src/themes/fuyukawa-kagari/pages/HomePage.astro`：HOME 所有舞台、状态和交互。
- `src/themes/fuyukawa-kagari/pages/AboutPage.astro`：ME 原版架构。
- `src/themes/fuyukawa-kagari/pages/BlogIndexPage.astro`：BLOG 搜索和列表。
- `src/themes/fuyukawa-kagari/pages/ProjectsPage.astro`：WORKS 展示。
- `src/core/data/profile.ts`：身份、技术、番剧、XP、最近状态。
- `src/core/data/projects.ts`：作品数据。
- `src/lib/site.ts`：站点身份和导航。
- `src/core/themes/registry.ts`：主题注册和路径映射。
- `src/themes/fuyukawa-kagari/assets.ts`：默认主题素材路径。
- `public/themes/fuyukawa-kagari`：默认主题公开资源。

不要把所有替换文本散落到页面中；尽可能沿用上游数据入口。只有视频背景层等上游没有的数据位可以做最小局部改动。

## 十三、差异白名单与自动检查

移植完成后生成“目标项目 vs 锁定上游”的差异报告。差异只应落在以下类别：

1. Rain_dust 身份与资料数据。
2. 头像、视频、海报和作品数据。
3. 删除 GAME 导航、路由和对应数据引用。
4. 旧路由兼容跳转。
5. 目标 Sites 部署适配。
6. 许可证、来源和第三方说明。

自动检查至少包括：

- `npm ci`
- Astro 类型/内容检查。
- 完整生产构建。
- Pagefind 索引成功。
- `git diff --check`
- 所有内部链接检查。
- `/`、`/blog/`、`/projects/`、`/about/` 和 404 返回正确。
- `/games/` 不再出现在导航或站点地图。
- `/works`、`/me` 正确跳转。
- 正常模式下 HOME 视频自动播放并在 10 秒内循环。
- 图片、音乐、图标、Live2D 和字体无 404。
- 浏览器控制台无未处理异常。
- 页面切换后没有重复监听、重复音乐或重复 canvas。
- `theme.css` 与锁定上游相同；若不同，必须逐行解释。
- 对未列入白名单的上游文件做哈希比对，确保没有“顺手优化”。

不要只报告“构建通过”，还要报告与上游之间到底改了哪些文件。

## 十四、人工视觉验收

必须使用浏览器逐页截图，与上游网站同视口并排比较：

- 桌面：`1440×900`
- 桌面：`1280×720`
- 手机：`390×844`
- 手机：`375×812`

逐项核对：

- 导航位置、尺寸、间距、出现方式和激活态。
- HOME 的主体占比、视频清晰度、裁切、自动播放与遮罩。
- 头像与资料终端的相对位置、滚动停靠和点击反馈。
- 所有浮动挂件、音乐、Live2D、右键菜单和公告。
- BLOG 搜索、时间线。
- WORKS 过滤、展开和动画。
- ME 左右栏、每个内容块及手机布局。
- 主题切换后的路由和视觉。

验收标准不是“风格相似”，而是除了替换清单与 GAME 删除外，布局和行为应能追溯到上游源码。

## 十五、实施批次与停止点

### Batch 1：忠实移植

- 建立回滚分支。
- 迁入上游源码、依赖和资源。
- 合并 Sites 构建桥接。
- 删除 GAME。
- 完成明确身份/素材替换。
- 本地构建、差异检查和全页面截图。

完成后先停止，向用户交付截图和差异报告。不要在用户尚未确认视觉结果时发布生产站点。

### Batch 2：部署

只有同时满足以下条件才执行：

- 用户确认本地视觉效果。
- 用户确认上游源码和相关素材的复制/发布授权。
- 密钥和第三方资源审计通过。

随后提交、保存 Sites 版本并发布到现有项目，不得创建新站点。

## 十六、回滚方案

- 当前生产版本和基线提交 `8cb81cc` 在用户验收前保持可恢复。
- 移植工作在独立 `codex/` 分支完成。
- 不删除原文件，直到上游文件已复制、构建且截图核对完成。
- 若新版本失败，恢复到移植前分支/提交和当前 Sites 已发布版本。
- 不使用 `git reset --hard` 清理用户工作区。

## 十七、最终交付格式

最终回复必须包含：

1. 结果：本地移植是否完成、是否部署。
2. 上游锁定提交。
3. 目标项目提交与分支。
4. 精确修改文件清单。
5. 与上游不同的全部差异类别。
6. 仍然保留的 Yuimi 专属文本/素材清单。
7. 权利、密钥和第三方素材审计结果。
8. 构建与自动检查结果。
9. 桌面和手机截图链接。
10. 回滚点。
11. 若已发布，现有站点的生产 URL 和部署版本。

不要用“基本复刻”“大体一致”作为完成结论。存在未解决差异时，明确列出；没有通过授权门槛时，明确停在本地验收阶段。

