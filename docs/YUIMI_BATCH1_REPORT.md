# Yuimi exact port · Batch 1 本地验收报告

日期：2026-07-29
状态：本地移植完成，未部署、未保存 Sites 版本。

## 1. 基线与回滚

- 唯一上游：`https://github.com/Yuimi-chaya/Yuimi-chaya.github.io`
- 锁定提交：`6b1dc0199d1fb824081f777c5f798ac933e8a94c`
- 工作分支：`codex/yuimi-exact-port-batch1`
- 移植前回滚分支：`codex/pre-yuimi-exact-port-v18`
- 移植前快照提交：`22f5903`
- 目标项目原生产基线 `8cb81cc` 未被改写；现有 Sites `project_id` 原样保留。

## 2. 结论

目标项目已换为锁定 Yuimi 源码的真实页面、主题、资源与交互实现。旧自创界面组件和未引用素材已移除。差异仅落在交接文档允许的身份/资料、头像与 HOME 媒体、作品数据、GAME 删除、旧路由兼容、Sites 桥接及来源审计类别。

## 3. 相对锁定上游的精确文件差异

以下列表不含构建目录、依赖、缓存和截图产物。

### 3.1 修改

- 构建、审计与说明：`.gitignore`、`astro.config.mjs`、`package.json`、`package-lock.json`、`README.md`
- 身份与数据：`src/core/ConsoleEasterEgg.astro`、`src/core/data/profile.ts`、`src/core/data/projects.ts`、`src/lib/site.ts`
- Blank 主题：`src/themes/blank/index.ts`、`src/themes/blank/layouts/BlankLayout.astro`、`src/themes/blank/pages/AboutPage.astro`、`ArticlePage.astro`、`BlogIndexPage.astro`、`HomePage.astro`、`NotFoundPage.astro`、`ProjectsPage.astro`
- Fuyukawa Kagari 主题：`src/themes/fuyukawa-kagari/assets.ts`、`data/noticeContent.ts`、`index.ts`、`layouts/ArticleLayout.astro`、`layouts/BaseLayout.astro`、`pages/AboutPage.astro`、`BlogIndexPage.astro`、`HomePage.astro`、`NotFoundPage.astro`、`ProjectsPage.astro`
- Kisara 主题：`src/themes/kisara/index.ts`、`layouts/KisaraLayout.astro`、`lib/routeWarmup.ts`、`pages/AboutPage.astro`、`ArticlePage.astro`、`BlogIndexPage.astro`、`HomePage.astro`、`ProjectsPage.astro`、`styles/about.css`
- `public/themes/fuyukawa-kagari/music/manifest.json` 仅被上游生成脚本规范化了换行；经 Git clean filter 后对象哈希与上游同为 `8cfe9d57d05f7c0719174c2dd519a040710ac293`，内容无差异。

### 3.2 删除

- `public/themes/kisara/games/2048/index.html`
- `src/core/data/games.ts`
- `src/pages/games.astro`
- `src/pages/themes/blank/games.astro`
- `src/pages/themes/kisara/games.astro`
- `src/themes/blank/pages/GamesPage.astro`
- `src/themes/fuyukawa-kagari/pages/GamesPage.astro`
- `src/themes/kisara/pages/GamesPage.astro`
- `src/themes/kisara/styles/games.css`

### 3.3 目标侧新增或保留

- Sites：`.openai/hosting.json`、`worker/index.js`、`scripts/prepare-sites.mjs`
- 兼容路由：`src/pages/works.astro`、`src/pages/me.astro`
- Rain_dust 媒体：`public/rain-dust/me/rain-dust-avatar.jpg`、`public/rain-dust/home/shadow-home-loop.mp4`、`public/rain-dust/home/shadow-home-poster.jpg`
- 审计与交接：`THIRD_PARTY.md`、`docs/HANDOFF_YUIMI_EXACT_PORT.md`、`docs/YUIMI_BATCH1_REPORT.md`
- 检查配置：`tsconfig.check.json`

除上述差异外，287 个上游文件保持原始字节哈希一致；三份 `theme.css` 均与锁定上游 SHA-256 完全相同。

## 4. 差异类别

1. Rain_dust 身份、社交链接与资料数据。
2. 头像、10 秒 HOME 视频、海报与五个真实仓库的作品数据。
3. 删除 GAME 导航、页面、路由、样式、数据和 2048 资源。
4. `/works` → `/projects/`、`/me` → `/about/` 的静态兼容跳转。
5. 保留现有 Sites 项目标识和构建桥接，并补回 `.env*` 等目标侧安全忽略规则。
6. 来源、第三方素材与生产授权门槛说明。

## 5. 保留的 Yuimi 专属内容

以下内容仅为本地结构和视觉验收保留，未改写为 Rain_dust 原创：

- `src/content/blog/` 的 8 篇上游文章。
- `DEVELOPMENT_NOTES.md` 与 `MUSIC/` 上游说明材料。
- Fuyukawa Kagari 的漫画背景、猪挂件、默认歌单（10 个清单文件/条目）、Live2D 接入与主题插画。
- Kisara 的人物叙事、动画演出、插画、音频和其他公开资源（`public/themes/kisara/` 共 80 个文件）。
- ME 中尚未获得 Rain_dust 明确清单的番剧、小说、游戏、技术栈和兴趣占位内容；只替换了交接中已经明确的信息。

## 6. 权利、密钥与第三方审计

- 锁定上游仓库根目录没有 LICENSE；不能据此推定拥有复制发布授权。
- 上游文章、角色图、音乐、Live2D 模型/API 和其他第三方素材的再发布权未确认。
- 源码、公开资源和文档的密钥特征扫描命中 0 个硬编码秘密。
- 上游腾讯地图密钥没有复制；仅保留可选的 `PUBLIC_TENCENT_MAP_KEY` 入口，未配置时使用上游其他定位尝试和本地降级。
- HOME 仍按上游方式请求 jsDelivr 上的 Live2D 组件、模型与纹理；本地浏览器资源清单中这些请求成功出现，但其长期可用性和授权仍属部署前门槛。
- 因授权未确认，本批次严格停在本地验收，没有生产部署。

## 7. 自动检查

- `npm ci`：通过，416 个包。
- `npm test`：通过，3/3。
- `npm run check`：通过，52 个纳入检查的文件、0 error。为避免给锁定上游的主题脚本做类型重构，`tsconfig.check.json` 排除了 `src/themes/**/*`；直接对全部上游主题脚本执行严格 Astro 检查会产生其既有的 291 条 JS/TS 诊断，这是未伪装为“全量类型通过”的限制。
- `npm run build`：通过，41 页；sitemap 生成；Pagefind 成功索引 41 页；Sites 桥接产物生成。
- `git diff --check`：已运行但未通过。暂存差异把整套上游源码视为相对旧目标基线的新增文件，因此报告 1 处上游文章作者行尾空格和 10 处上游文件 EOF 空行；这些字节与锁定上游一致，为避免“顺手格式化”而保留。本文自身的空白问题已修正。
- HTML 内部引用：41 个 HTML、754 个本地引用、0 缺失。
- CSS 资源引用：12 个 CSS、16 个本地 URL、0 缺失。
- HTTP：`/`、`/blog/`、`/projects/`、`/about/` 均为 200；未知路径和 `/games/` 为 404；自定义 404 正常。
- `/works` 与 `/me`：Astro 静态构建输出正确的 meta refresh，分别指向 `/projects/` 与 `/about/`。静态预览服务器返回 200，而不是服务端 301。
- GAME：源码导航、构建路由和 sitemap 中均为 0。
- HOME 视频：文件时长 `00:00:10`，标签包含 `autoplay muted loop playsinline`；测试浏览器强制启用减少动态效果，运行时验证了海报降级和视频暂停，无法在该浏览器中声称“正常动效偏好下实际自动播放”已运行验证。
- 浏览器控制台：四个核心页面及三套主题均无 error/warning。
- 重复挂载：连续 3 轮打开四个核心路由，默认主题始终保持 1 个 header、1 个 toy dock；HOME 保持 2 个 canvas、1 个 video，其他页保持 0 个 HOME canvas/video。
- 主题切换：Fuyukawa Kagari → Kisara 路由和 `data-theme` 正确；Kisara、Blank 首页无横向溢出、无旧可见身份文案、无 GAME 导航。
- `theme.css`：
  - Fuyukawa Kagari：`ADCF2A61EB85D2829ED600D3161CD13BD7B7C78E82D8B029BA0F38D530C6CC88`
  - Blank：`E0A171BE616E723BD32BF7FCF6FAA5C38B0BDC68C86ED07D3918078275FC9D30`
  - Kisara：`1937DA8810C536D0D5EE8C2BA26BBC4C1BDF5AC39741588FA5350B53F0DEBA65`

## 8. 视觉验收

已对本地与 `https://yuimi-chaya.github.io` 的 HOME、BLOG、WORKS、ME 在 `1440×900`、`1280×720`、`390×844`、`375×812` 下各取全页截图，共 32 张；另取 Kisara、Blank 首页截图 2 张。

- 16 张本地核心页均无横向溢出和旧可见身份文案。
- HOME、BLOG 在四个视口下的全页高度与上游逐像素尺寸一致。
- WORKS、ME 的高度差来自允许替换的真实项目描述和个人资料文本。
- 导航、挂件、播放器、Live2D、公告、搜索/时间线、作品筛选、ME 分栏和三主题结构均来自上游源码。

截图索引见 `artifacts/yuimi-batch1/SCREENSHOTS.md`。

## 9. 停止点

Batch 1 已完成并停止。进入 Batch 2 前仍需：

1. 用户确认本地视觉结果。
2. 用户确认上游源码、文章、角色图、音乐、Live2D 等相关素材的复制与发布授权。
3. 用户接受或替换保留的上游占位内容。
4. 在可关闭“减少动态效果”的浏览器中补验 HOME 正常模式自动播放。
