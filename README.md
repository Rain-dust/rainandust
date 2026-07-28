# 寻辰沐雨 / RAIN_DUST

一个基于 Astro 的内容优先个人作品集。

## 当前架构

```text
src/content/projects/  作品内容
src/pages/             页面路由
src/layouts/           文档与元信息
src/components/        可复用视觉结构
src/scripts/           按需加载的交互
src/styles/            全站视觉规则
```

页面默认输出静态 HTML，只为连接作品焦点的信号场加载少量浏览器脚本。作品内容与视觉实现分离，新增项目不需要修改页面组件。

## 当前内容

- Earth Online
- 浮生录
- 知微
- Campus Reimburse Kit（末尾克制索引）

## 视觉与交互

- 冷白、蓝黑、冷银与单一深红信号色
- 白昼构图由一道稳定的暗面切入，不再播放完整角色登场
- 三件作品组成同一张连续画面，不使用卡片网格
- Canvas 信号线只连接作品与当前焦点，不承担页面内容
- `prefers-reduced-motion` 使用完整静态状态
- 键盘可聚焦的作品与联系链接

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
npm run check
npm test
```

## 主要文件

- `src/pages/index.astro`：首页组合
- `src/content/projects/`：项目内容集合
- `src/components/ProjectField.astro`：非卡片作品场
- `src/scripts/signal-field.ts`：轻量 Canvas 信号连接
- `src/styles/global.css`：完整视觉与响应式规则
- `public/rain-dust/masters/`：三件作品画面
- `CONTEXT.md`：设计语境与禁止项

## 已知内容缺口

真实公开邮箱尚未提供，因此当前结尾只发布 GitHub 联系入口，不使用猜测地址或占位符。
