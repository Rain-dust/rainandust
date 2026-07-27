# 寻辰沐雨 / RAIN_DUST — Portfolio V6

`DAY MASK / NIGHT SELF` 是一个固定在 `100dvh` 舞台中的滚动电影式作品集。本轮严格限定为 V6 Phase A：白昼外壳、侵蚀、下潜、Earth Online 遗物召唤、聚合与坍缩。

页面没有传统纵向内容区块。物理滚动轨道只负责把进度映射到 `0.00–0.50` 的叙事时间线；反向滚动沿同一套确定性函数逐帧还原。

## 运行与验证

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
npm run lint
npm test
```

## Phase A 时间线

| 叙事进度 | 场景 |
| --- | --- |
| `0.00–0.14` | DAYLIGHT：白昼面具、线稿人物、红色眼部信号 |
| `0.14–0.30` | EROSION：程序化噪声侵蚀、裂纹与冷银边缘 |
| `0.30–0.40` | DESCENT：镜头下潜、雾密度与夜色增加 |
| `0.40–0.43` | EARTH SUMMON：12 片遗物从深处进入 |
| `0.43–0.47` | EARTH ASSEMBLED：共享 UV 母图聚合，节点与轨迹激活 |
| `0.47–0.50` | EARTH COLLAPSE：碎片向确定性坍缩坐标离场 |

## WebGL 遗物系统

- 单个全屏 WebGL Canvas，不以 DOM `clip-path` 充当最终碎片。
- `app/relic-topology.ts` 保存种子 `rain-dust-relic-v6-earth-042` 和 12 片离线固定拓扑。
- 每片使用 `ExtrudeGeometry`，包含正反面、内侧面、厚度与斜切边缘。
- 所有外表面 UV 都回映到同一张 `2560×1440` Earth 母图，聚合时连续还原画面。
- 侵蚀 shader 为本项目独立编写；没有复制参考仓库的 dissolve shader。
- 桌面端使用轻量 DOF、低强度 bloom 与输出通道；移动端跳过后处理。

## 数据路径

- 项目与固定拓扑：`app/relic-topology.ts`
- WebGL 引擎：`app/night-relic-canvas.tsx`
- 时间线与无障碍交互：`app/page.tsx`
- Earth 夜间母图：`public/rain-dust/masters/earth-night-master.webp`
- 白昼人物临时图：`public/rain-dust/hero/hero-girl-lineart-temp-v2.webp`
- 私人痕迹接口：`PrivateTrace` 已定义，数据数组刻意保持为空；未伪造占位内容。

## 性能与降级

- DPR 上限：桌面 `1.75`，移动端 `1.25`。
- Earth 纹理仅在接近下潜尾声时加载。
- WebGL 初始化失败时显示静态 Earth 母图。
- `prefers-reduced-motion` 下固定为 DAY 或 EARTH 两个稳定构图，并显示显式切换按钮。
- 支持方向键、Home、End 和原生滚动；所有外链保持键盘可聚焦。

## 当前缺失

- 白昼人物仍是初稿中的临时素材，正式发布前应替换为原创或明确授权版本。
- Earth Online 当前仅提供源码链接，线上 Demo 尚未提供，因此 `VIEW` 保持不可用。
- V6 的 `0.50–1.00` 后续夜间核心阶段不属于本轮 Phase A，未提前实现。

开源研究来源与许可证记录见 [THIRD_PARTY.md](./THIRD_PARTY.md)。
