# BLOG 写作与发布

BLOG 使用 Astro Markdown 内容集合。编辑权来自仓库权限：只有能够修改并重新发布这个仓库的人可以编辑，网站访客只能读取构建后的 HTML，线上没有编辑入口。

## 新建草稿

在项目目录运行：

```text
npm run blog:new -- "文章标题"
```

命令会在 `src/content/blog/` 创建一个 `draft: true` 的 Markdown 文件。把已有 Markdown 正文粘贴到 frontmatter 下方即可。

也可以复制 `src/content/blog/_template.md.example`，将副本改名为以 `.md` 结尾的文件。

## 图片

把封面和正文图片放到：

```text
public/images/blog/
```

在 frontmatter 中填写封面：

```yaml
cover: "/images/blog/cover.webp"
coverAlt: "准确描述封面图片内容"
```

正文插图使用标准 Markdown：

```md
![准确描述图片内容](/images/blog/illustration.webp)
```

### 已准备的 BLOG 图像

三张独立文章封面（每篇文章任选一张，不要合并使用）：

```text
/images/blog/cover-violet-gaze-01.webp
/images/blog/cover-summer-white-01.webp
/images/blog/cover-shadow-portrait-01.webp
```

粉发网点图是正文插图，不作为文章封面：

```md
![粉发角色与笔记纸张构成的网点印刷插图](/images/blog/inline-pink-notes-01.webp)
```

推荐优先使用 WebP 或 AVIF。封面建议横图，正文图片不限比例；不要把版权来源不明的图片放进公开站点。

## 发布

写作期间保持：

```yaml
draft: true
```

确认内容后改为：

```yaml
draft: false
```

再运行 `npm test` 和 `npm run build`。只有 `draft: false` 的文章会出现在 BLOG 列表和公开路由中。

## 可用分类

- `tech`：技术
- `anime`：动画
- `life`：生活

frontmatter 的完整格式以 `src/content/blog/_template.md.example` 为准。
