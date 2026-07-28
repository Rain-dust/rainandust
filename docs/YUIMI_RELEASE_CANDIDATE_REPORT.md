# Yuimi exact port · Release Candidate 报告

日期：2026-07-29

状态：Batch 1.1–1.6 与本地 Release Candidate 已完成；未创建 Sites 版本、未部署。

## 1. 锁定基线

- 唯一界面与交互上游：`https://github.com/Yuimi-chaya/Yuimi-chaya.github.io`
- 锁定提交：`6b1dc0199d1fb824081f777c5f798ac933e8a94c`
- 上游本地副本：`D:\Users\Documents\个人作品集\yuimi-chaya-reference`，工作树干净。
- 目标分支：`codex/yuimi-exact-port-batch1`
- Batch 1 提交：`8253657814a1d516541d2c2ee7b3277798650e4f`，仍为当前历史祖先。
- Sites 项目：继续使用 `.openai/hosting.json` 中的 `appgprj_6a64ce4ba66c81918104a42216b9ed43`；本批次没有调用保存版本或部署。

## 2. RC 结论

目标站点继续使用锁定 Yuimi 源码，不含旧自创界面。正常动态、减少动态、全交互、路由、主题、外部依赖失败、视觉对照、白名单、密钥和构建门禁均已形成可复跑证据。

本轮唯一产品数据补全是为六个 WORKS 项目加入已验证的 GitHub 入口。它落在既有 37 个允许修改文件内，没有扩大上游差异文件集合。

## 3. 动态与 HOME 视频

- Chromium 150 桌面 `1440×900` 与手机 `390×844` 正常动态均实测自动播放。
- 标签与运行态：单一 video，`autoplay`、`muted/defaultMuted`、`loop`、`playsInline` 均为 true；`readyState=4`，两秒推进约 2.0 秒。
- 在 0.5、5、9.5 秒和回环后均有截图；实际观察到约 10 秒回环。
- 刷新、页面可见性、HOME/BLOG 三轮 SPA 往返后，video、tag canvas、工具 dock 与音频控制器均无重复挂载。
- 减少动态模式下桌面和手机均为 `mediaState=fallback`、视频暂停，核心布局无横向溢出。
- 媒体参数：H.264/AVC (`avc1`)，`1640×720`，10.066667 秒，1,189,114 bytes，平均约 945 kbps，无 `mp4a` 音轨。
- 实际绘制尺寸：桌面 `1440×900`，手机 `390×844`。浏览器解码清晰、首屏加载可用，未触发重新编码条件。

证据：`artifacts/yuimi-release-candidate/motion-results.json` 与 `motion/`。

## 4. 交互、路由与失败路径

Chromium 最终矩阵 15/15 通过，Edge 150 同矩阵 15/15 通过。覆盖：

- 顶部导航悬停展开、4 个键盘可达链接和焦点可见规则。
- 工具 dock、猪滚动条、tag canvas、Live2D 状态和页脚计时。
- 右键菜单边界，以及 Fuyukawa Kagari → Blank → Kisara 的当前页路由映射。
- 公告打开/关闭、打字机、滚动提示、头像双击、天气降级。
- 音乐播放与三轮 HOME/BLOG SPA 生命周期，无重复控制器或媒体。
- Pagefind 搜索、清空、文章打开、作者归属和 Pagefind 被阻断后的本地搜索后备。
- WORKS 筛选、卡片展开/收起、轨道结构和六个真实 GitHub 入口。
- ME 桌面 sticky、圆形头像、GitHub/邮箱与手机无横向溢出。
- `/works`、`/me` 兼容跳转；前进/后退；GAME 和未知路径均进入自定义 404；三主题导航均无 GAME。
- 全部非本地域名被拦截时，HOME、导航和本地视频仍可用，Live2D/天气明确降级。

控制台中的 429 来自上游 Live2D/CDN 限流；404 来自矩阵主动访问 `/games/` 和未知路径；SPA 切页产生的本地 `ERR_ABORTED` 为被新导航取消的媒体请求。分类后未预期 console error 与 network failure 均为 0。

证据：`artifacts/yuimi-release-candidate/interaction-matrix.json`、`runtime-summary.json` 和 `edge/`。

## 5. 视觉对照

HOME、BLOG、WORKS、ME 均以 `1440×900`、`1024×768`、`768×1024`、`390×844` 抓取本地/上游首屏与全页，并生成三联图。遮罩只覆盖已允许替换的身份、项目/资料文本、头像/视频、canvas、时间/天气和动态状态。

遮罩外像素差异：

| 页面 | 1440 | 1024 | 768 | 390 | 归因 |
| --- | ---: | ---: | ---: | ---: | --- |
| HOME | 0.00% | 0.00% | 0.00% | 0.00% | 媒体与身份区已按许可遮罩 |
| BLOG | 0.00% | 0.00% | 0.00% | 0.00% | 结构与上游一致 |
| WORKS | 0.25% | 0.25% | 1.66% | 0.50% | 真实项目文本的自然换行和内容高度 |
| ME | 1.69% | 0.33% | 2.90% | 1.45% | Rain_dust 资料文本的自然换行和内容高度 |

未发现漏资源、错误布局或为追求差异数字而改动 `theme.css`。三联图和原图索引见 `artifacts/yuimi-release-candidate/SCREENSHOTS.md`。

## 6. 上游诊断与差异守卫

- 全量 Astro 诊断：目标 74 文件、锁定上游 72 文件，双方均为 989 个上游既有错误。
- 以文件、TS 错误码和消息作为诊断身份（允许替换会造成行号漂移），目标新增诊断 0，上游独有诊断 0。
- 允许修改仍为 37 个，允许删除仍为 9 个；287 个上游文件保持字节一致。
- 未在白名单中的修改/删除均为 0；缺失的预期差异为 0。
- 三套 `theme.css` SHA-256 与锁定上游逐字节一致。
- 目标新增尾随空白 0；硬编码密钥特征命中 0。
- `PUBLIC_TENCENT_MAP_KEY` 仍是唯一可选公开客户端配置入口，没有复制上游密钥。

证据：`artifacts/yuimi-release-candidate/audit/audit-results.json` 与 `diagnostics/diagnostic-comparison.json`。

## 7. 身份、来源与项目真实性

- Rain_dust 的显示身份、GitHub、邮箱、头像、HOME 视频/海报和项目数据保持在明确替换面。
- `Yuimi` 字样的其余源码命中属于主题内部标识、锁定上游说明或保留文章；文章作者归属仍保留，不冒充 Rain_dust 原创。
- 构建产物中的旧作者内容只随保留文章和主题内部标识出现；它们仍受发布权利闸门约束。
- 六个项目链接均由 Git 远端验证存在：`earth-online`、`fushenglu`、`MindCache`、`campus-reimburse-kit`、`Zhi-Wei`，以及 Rain-dust 仓库总览；项目文案未虚构演示地址或状态。
- `THIRD_PARTY.md` 已按主题源码、文章、图片、音乐、Live2D、字体、图标、CDN/API 和 Rain_dust 自有素材分别记录来源、构建状态、许可、生产状态与替换路径。

## 8. 最终质量门

- `npm ci`：通过，416 packages。
- `npm test`：7/7 通过。
- `npm run check`：57 files，0 errors。
- `npm run build`：41 pages；sitemap 与 Sites 桥接产物成功；Pagefind 索引 41 pages。
- 构建引用：41 HTML、12 CSS、755 个 HTML 本地引用、13 个 CSS 本地引用，缺失 0。
- `git diff --check`：通过。
- Chromium 150 最终生产预览矩阵：15/15。
- Edge 150 矩阵：15/15。
- Firefox/WebKit 当前未安装；依文稿要求没有为凑数量下载浏览器。

## 9. 发布权利闸门

锁定上游根目录没有 LICENSE，源码、文章、角色图、音乐、Live2D 模型/API 与其他第三方素材的公开再发布权仍未得到本次对话中的明确确认。因此 RC 严格停在本地：

- 没有保存 Sites 版本。
- 没有部署生产站点。
- 没有把公开可见误当作允许复制发布。

只有获得站点所有者对全部相关权利的明确确认后，才可进入 Batch 2。
