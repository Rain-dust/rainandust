# 上游来源与第三方素材说明

本地 Batch 1 以 Yuimi-chaya 的公开仓库源码为唯一界面与交互基线：

- 上游仓库：`https://github.com/Yuimi-chaya/Yuimi-chaya.github.io`
- 锁定提交：`6b1dc0199d1fb824081f777c5f798ac933e8a94c`
- 本地用途：结构移植、构建验证与视觉验收

锁定提交的仓库根目录未发现 `LICENSE` 文件。公开可见不等于获得复制和再发布授权，因此当前移植不得发布到生产站点；公开部署前必须由站点所有者确认已经取得覆盖源码、文章与素材再发布的许可。

## 分类审计

| 类别 | 来源/构建来源 | 已知许可 | 当前生产状态 | 发布前处理 |
| --- | --- | --- | --- | --- |
| 主题源码 | 锁定 Yuimi 仓库中的 `src/themes/`、`src/core/` | 仓库根目录无 LICENSE；未确认 | 仅本地 RC | 取得明确复制与再发布授权，或替换为有许可实现 |
| 博客文章 | `src/content/blog/`，作者元数据保留 Yuimi-chaya/喝益胃 | 未确认文章转载许可 | 仅本地搜索与渲染验证 | 取得逐篇转载授权或删除/替换；不得改署 Rain_dust |
| 图片与角色插画 | `public/themes/fuyukawa-kagari/`、`public/themes/kisara/` | 未找到覆盖全部动漫/角色素材的许可 | 仅本地 RC | 逐项取得许可，或替换为自有/明确授权素材 |
| 音乐与音效 | 两套主题的 `music/`、`audio/` 及 manifest | 未确认录音、词曲及再传播权 | 仅本地播放器验证 | 取得完整网络传播许可，或全部移除/替换 |
| Live2D | Yuimi 前端接入、jsDelivr 上的组件/模型/纹理 | 组件与模型许可未完成逐项确认 | 本地可选外链；失败时降级 | 核对组件许可证与模型权利；否则禁用并移除模型请求 |
| 字体 | 上游 CSS 的系统字体栈及主题随附/引用字体 | 系统字体随终端环境；其他字体许可未逐项确认 | 本地 RC | 仅保留系统栈，或为每个 Web Font 留存许可 |
| 图标 | `astro-icon`、Tabler、Simple Icons 构建依赖与上游图标用法 | 包内许可证随 npm 依赖；商标仍归各权利人 | 可构建，未单独授权背书 | 发布时保留依赖许可证并遵守商标规范 |
| CDN/外部 API | jsDelivr Live2D 资源、上游天气/定位降级链 | 服务条款与内容许可独立 | 仅本地失败模式验证 | 复核服务条款、隐私披露、CSP 与长期可用性 |
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

当前文档只记录来源与风险，不构成任何授权结论。只有站点所有者明确确认已拥有上游源码、文章、角色图、音乐、Live2D 及其他第三方素材的复制和公开发布权后，才可创建 Sites 版本并部署。
