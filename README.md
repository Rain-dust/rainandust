# 寻迹沐雨 / RAIN_DUST — Portfolio V4

固定在 `100dvh` 舞台内的滚动电影式作品集。页面保留不可见的滚动轨道，滚轮只推进连续、可逆的视觉时间线；作品不会以传统纵向区块、卡片墙或整屏 PPT 的方式出现。

## 运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

验证：

```bash
npm run build
npm test
```

## Scroll timeline

- `0%–16%`：Opening / Wake。标题、少女线稿、红瞳与发丝响应首轮滚动。
- `16%–28%`：Transition / Fracture。线稿和文字拆解为光路，Earth Online 从景深中进入。
- `28%–83%`：Project Constellations。Earth Online、浮生录、Campus Reimburse Kit、知微依次聚合、停留和解体。
- `83%–94%`：All Works / Orbit。四个代表碎片组成作品星图，可点击返回对应项目。
- `94%–100%`：Identity / Contact。只保留身份与联系方式。

项目中心设有柔和吸附点，支持滚轮、触控板、触屏原生纵向滚动、方向键、Home 与 End。反向滚动会沿同一时间线还原。

## 共享母版碎片

每个项目只有一张 2560×1440 WebP 母版。所有碎片共用一组 `sourceRect` 坐标与同一背景尺寸，通过 `background-size` 和 `background-position` 将母版对应区域映射进不规则裁切；聚合时能连续看到同一画面的主体、文字和轨迹。

母版路径：

- `public/rain-dust/masters/earth-master.webp`
- `public/rain-dust/masters/fushenglu-master.webp`
- `public/rain-dust/masters/reimburse-master-placeholder.webp`
- `public/rain-dust/masters/zhiwei-master.webp`

## 仍需补充

- `public/rain-dust/hero/hero-girl-lineart-temp-v2.webp` 是临时少女线稿，正式发布前应替换为原创授权素材。
- `public/rain-dust/masters/reimburse-master-placeholder.webp` 是本轮根据现有信息制作的临时报销工具母版；取得真实界面后可同路径替换。
- 四个项目暂未提供独立线上 Demo，界面中的 `VIEW` 因此保持不可用；`SOURCE` 均指向现有 GitHub。
- Email 仍未提供，Identity 中显示为不可用占位。

本轮没有新增运行依赖。
