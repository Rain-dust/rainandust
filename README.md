# 寻辰沐雨 / RAIN_DUST — Portfolio V1

按 `Rain Dust Portfolio V1 Design Pack` 实现的单页个人作品集原型。站点以雾白编辑设计、少女线稿、光标显影、个人观察碎片和项目空间碎片构成，不使用卡片墙或封面矩阵。

## 运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

构建验证：

```bash
npm run build
npm test
```

## 结构

```text
app/
  page.tsx       单页内容、探索状态、光标显影、轨迹与项目唤醒交互
  globals.css    视觉 tokens、布局、动效、响应式与 Reduced Motion
  layout.tsx     中文页面元信息
public/
  rain-dust/     设计包提供的首屏、项目碎片与真实截图素材
tests/
  rendered-html.test.mjs
```

## V1 已完成

- Opening 首屏、进入动画、5 根独立发丝、柔和光标显影
- Signal Trace 与基于探索行为的 `EXPLORED`
- Hero → About 的连续滚动雾化转场
- About 人格、身份与三张真实创作碎片
- Digital Interlude 的短暂光标轨迹与隐藏节点
- Earth Online、浮生录、Campus Reimburse Kit、知微四组空间碎片
- Archive、Other Side 覆盖层与 Contact
- GitHub 新标签跳转、手机端降级、`prefers-reduced-motion`

## V1 暂留

- `hero-girl-lineart-temp-v2.png` 是设计包注明的临时原型资产，正式发布前需替换为原创且授权明确的透明线稿。
- 邮箱与 Bilibili 仍为占位符。
- `SOUND OFF` 仅保留状态 UI，没有内置音频。
- 项目详情页暂不制作，项目名直接打开对应 GitHub。
