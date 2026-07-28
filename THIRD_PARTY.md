# 上游来源与第三方素材说明

本地 Batch 1 以 Yuimi-chaya 的公开仓库源码为唯一界面与交互基线：

- 上游仓库：`https://github.com/Yuimi-chaya/Yuimi-chaya.github.io`
- 锁定提交：`6b1dc0199d1fb824081f777c5f798ac933e8a94c`
- 本地用途：结构移植、构建验证与视觉验收

锁定提交的仓库根目录未发现 `LICENSE` 文件。公开可见不等于获得复制和再发布授权，因此当前移植不得发布到生产站点；公开部署前必须由站点所有者确认已经取得覆盖源码、文章与素材再发布的许可。

## 当前保留的上游内容

- Fuyukawa Kagari、Blank 与 Kisara 三套主题的源码结构、样式和交互。
- 上游博客文章，仅用于本地结构、Pagefind 与文章渲染验证；作者仍为 Yuimi-chaya，不得以 Rain_dust 名义发布。
- 上游动漫图片、音乐、Live2D/角色素材、字体与其他主题资源。它们可能分别受第三方版权或许可约束，尚未完成逐项授权审计。

## Rain_dust 自有替换

- 头像：`public/rain-dust/me/rain-dust-avatar.jpg`
- HOME 视频：`public/rain-dust/home/shadow-home-loop.mp4`
- HOME 海报：`public/rain-dust/home/shadow-home-poster.jpg`
- 站点身份与项目资料：见 `src/lib/site.ts`、`src/core/data/profile.ts` 和 `src/core/data/projects.ts`

## 服务密钥

上游源码中的腾讯地图密钥未被复制到目标实现。目标站点仅从 `PUBLIC_TENCENT_MAP_KEY` 读取 Rain_dust 自己的公开客户端密钥；未配置时沿用上游的其他定位尝试和本地时区降级。
