# 上游来源与第三方素材说明

本地 Batch 1 以 Yuimi-chaya 的公开仓库源码为唯一界面与交互基线：

- 上游仓库：`https://github.com/Yuimi-chaya/Yuimi-chaya.github.io`
- 锁定提交：`6b1dc0199d1fb824081f777c5f798ac933e8a94c`
- 本地用途：结构移植、构建验证与视觉验收

锁定提交的仓库根目录未发现 `LICENSE` 文件。站点所有者已在
`docs/RAIN_DUST_CONTENT_REPLACEMENT_EXECUTION.md` 中明确记录
`RIGHTS_CONFIRMED = YES`。本轮生产内容仅保留获准使用的页面实现与素材；
上游文章和 Live2D/waifu 运行链路已从目标生产版本移除。

## 分类审计

| 类别 | 来源/构建来源 | 已知许可 | 当前生产状态 | 发布前处理 |
| --- | --- | --- | --- | --- |
| 主题源码 | 锁定 Yuimi 仓库中的 `src/themes/`、`src/core/` | 仓库根目录无 LICENSE；未确认 | 仅本地 RC | 取得明确复制与再发布授权，或替换为有许可实现 |
| 博客文章 | 锁定上游与 Git 历史 | 不进入目标生产内容集合 | 已删除，BLOG 使用零文章状态 | 如未来恢复，需逐篇确认归属与授权；不得改署 Rain_dust |
| 图片与角色插画 | `public/themes/fuyukawa-kagari/`、`public/themes/kisara/` | 未找到覆盖全部动漫/角色素材的许可 | 仅本地 RC | 逐项取得许可，或替换为自有/明确授权素材 |
| 音乐与音效 | 两套主题的 `music/`、`audio/` 及 manifest | 未确认录音、词曲及再传播权 | 仅本地播放器验证 | 取得完整网络传播许可，或全部移除/替换 |
| Live2D | 锁定上游与 Git 历史 | 不进入目标生产运行链路 | DOM、脚本、样式、fallback 与外部请求均已移除 | 如未来恢复，需重新核对组件与模型许可 |
| 字体 | 上游 CSS 的系统字体栈及主题随附/引用字体 | 系统字体随终端环境；其他字体许可未逐项确认 | 本地 RC | 仅保留系统栈，或为每个 Web Font 留存许可 |
| 图标 | `astro-icon`、Tabler、Simple Icons 构建依赖与上游图标用法 | 包内许可证随 npm 依赖；商标仍归各权利人 | 可构建，未单独授权背书 | 发布时保留依赖许可证并遵守商标规范 |
| CDN/外部 API | 上游天气/定位降级链 | 服务条款与内容许可独立 | 保留非 Live2D 的现有功能 | 复核服务条款、隐私披露、CSP 与长期可用性 |
| Rain_dust 自有媒体与数据 | 下表列出的头像、HOME 视频/海报、身份与仓库资料 | 由站点所有者确认 | 可作为替换项候选 | 上线前由所有者最终确认权属与公开范围 |

## Rain_dust 自有替换

- 头像：`public/rain-dust/me/rain-dust-avatar.jpg`
- HOME 视频：`public/rain-dust/home/shadow-home-loop.mp4`
- HOME 海报：`public/rain-dust/home/shadow-home-poster.jpg`
- 站点身份与项目资料：见 `src/lib/site.ts`、`src/core/data/profile.ts` 和 `src/core/data/projects.ts`

这些替换项不改变 Yuimi 上游其余内容的权利状态，也不能作为整站部署授权。

## 服务密钥

上游源码中的腾讯地图密钥未被复制到目标实现。目标站点仅从 `PUBLIC_TENCENT_MAP_KEY` 读取 Rain_dust 自己的公开客户端密钥；未配置时沿用上游的其他定位尝试和本地时区降级。

## 发布闸门

当前文档记录来源、生产范围与风险。站点所有者已确认本轮保留内容的公开发布权；
被本轮明确删除的文章、Live2D/waifu 与相关 fallback 不得从历史记录中自动恢复到生产站点。
