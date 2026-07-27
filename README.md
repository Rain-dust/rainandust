# 寻辰沐雨 / RAIN_DUST — Portfolio V3

固定在 `100dvh` 内的单屏空间式作品集。页面通过 Opening、Workspace、Project Focus、Info 四个状态切换，作品以配置化不规则玻璃碎片呈现，不使用纵向长滚动、卡片墙或传统项目详情页。

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

## 状态结构

- `opening`：主标题、少女线稿、异步发丝动画和人物区域显影。
- `workspace`：四个项目名与 4–6 块配置化玻璃碎片；悬停或点击切换当前项目。
- `project-focus`：当前碎片进一步聚拢，只显示年份、标签、短定义和链接。
- `info`：INTP、INDEPENDENT BUILDER、AI-NATIVE CREATOR 与联系方式。

支持鼠标、滚轮、方向键、Enter、Escape、触摸点击与横向滑动，并提供 `prefers-reduced-motion` 降级。

## 主要文件

```text
app/page.tsx       四状态状态机、项目与碎片配置、键盘/触控交互
app/globals.css    单屏布局、碎片聚拢、显影、发丝、响应式与 Reduced Motion
app/layout.tsx     页面元信息
public/rain-dust/  设计包提供并已做网页格式优化的素材
```

## 仍需补充

- `hero-girl-lineart-temp-v2.webp` 仍是设计包注明的临时线稿，正式发布前需替换为原创授权素材。
- 四个项目暂未提供独立线上 Demo，因此 `VIEW` 为不可用状态，`SOURCE` 指向真实 GitHub。
- Email 与 Bilibili 仍为占位符。
