import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error('用法：npm run blog:new -- "文章标题"');
  process.exitCode = 1;
} else {
  const slug = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || `note-${Date.now()}`;
  const directory = resolve("src/content/blog");
  const destination = resolve(directory, `${slug}.md`);

  if (existsSync(destination)) {
    console.error(`草稿已存在：${destination}`);
    process.exitCode = 1;
  } else {
    mkdirSync(directory, { recursive: true });
    const today = new Date().toISOString().slice(0, 10);
    const template = `---
title: "${title.replaceAll('"', '\\"')}"
description: "用一句话概括这篇文章"
pubDate: ${today}
cover: "/images/blog/your-cover.webp"
coverAlt: "封面图片说明"
tags: []
category: life
draft: true
---

把 Markdown 正文粘贴到这里。

## 第一节

正文。

![图片说明](/images/blog/your-image.webp)

> 图片和引用都可以使用标准 Markdown。
`;
    writeFileSync(destination, template, "utf8");
    console.log(`已创建私人草稿：${destination}`);
    console.log("完成后将 draft 改为 false，再构建发布。");
  }
}
