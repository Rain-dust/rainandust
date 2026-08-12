import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  animeFavorites,
  currentSignals,
  favoriteReading,
  profileTech,
  xpFavorites
} from "../src/core/data/profile.ts";
import { projectEntries, projectTechLines } from "../src/core/data/projects.ts";

const root = new URL("../", import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), "utf8");

test("BLOG is absent from public routes and navigation", () => {
  const site = read("src/lib/site.ts");
  assert.equal(existsSync(new URL("src/pages/blog/index.astro", root)), false);
  assert.equal(existsSync(new URL("src/pages/blog/[...slug].astro", root)), false);
  assert.doesNotMatch(site, /href: "\/blog\/"/);
});

test("public profile data contains only the confirmed Rain_dust facts", () => {
  assert.deepEqual(profileTech.map(({ key }) => key), [
    "threejs",
    "python",
    "nextjs",
    "solidworks",
    "creo",
    "autocad",
    "bambu3d",
    "opencv",
    "yolo"
  ]);
  assert.deepEqual(projectTechLines.map(({ key }) => key), [
    "threejs",
    "pwa",
    "python",
    "nextjs",
    "javascript"
  ]);
  assert.deepEqual(animeFavorites.map(({ key }) => key), ["eminence-in-shadow"]);
  assert.deepEqual(xpFavorites.map(({ key }) => key), [
    "white-hair",
    "red-eyes",
    "barefoot-imagery"
  ]);
  assert.deepEqual(favoriteReading.map(({ key }) => key), [
    "novel",
    "web-fiction",
    "metaphysics"
  ]);
  assert.deepEqual(currentSignals.map(({ label }) => label), [
    "正在做",
    "最近在折腾",
    "当前状态"
  ]);
});

test("WORKS contains the five verified repositories and the repository index", () => {
  assert.deepEqual(projectEntries.map(({ id }) => id), [
    "earth-online",
    "fushenglu",
    "mindcache",
    "campus-reimburse-kit",
    "zhi-wei",
    "more-projects"
  ]);
  assert.equal(projectEntries.every(({ url }) => url.startsWith("https://github.com/Rain-dust")), true);
});

test("PROJECTS renders a repository index without the retired card interactions", () => {
  const projects = read("src/themes/fuyukawa-kagari/pages/ProjectsPage.astro");
  assert.match(projects, /Projects/);
  assert.match(projects, /项目档案/);
  assert.match(projects, /GitHub Archive/);
  assert.match(projects, /href=\{project\.url\}/);
  assert.match(projects, /target="_blank"/);
  assert.match(projects, /rel="noreferrer"/);
  assert.doesNotMatch(projects, /works-filter|works-tech-board|works-card|data-card-toggle|data-card-panel/);
});

test("only the user-authored BLOG article is present and inherited assets remain absent", () => {
  const blogDirectory = new URL("src/content/blog/", root);
  const markdown = existsSync(blogDirectory)
    ? readdirSync(blogDirectory).filter((name) => name.endsWith(".md"))
    : [];
  assert.deepEqual(markdown, ["codex-app-long-term-usage-habits.md"]);
  const article = read("src/content/blog/codex-app-long-term-usage-habits.md");
  assert.match(article, /Codex App 用久以后，我留下的这些使用习惯/);
  assert.match(article, /draft: false/);
  assert.equal(existsSync(new URL("public/blog-assets/", root)), false);
});

test("Blank and Kisara no longer have public route files", () => {
  for (const theme of ["blank", "kisara"]) {
    const directory = new URL(`src/pages/themes/${theme}/`, root);
    const files = existsSync(directory)
      ? readdirSync(directory, { encoding: "utf8", recursive: true })
          .filter((name) => name.endsWith(".astro"))
      : [];
    assert.deepEqual(files, [], theme);
  }
});

test("Fuyukawa runtime has no Live2D or waifu implementation", () => {
  const runtime = [
    read("src/themes/fuyukawa-kagari/layouts/BaseLayout.astro"),
    read("src/themes/fuyukawa-kagari/pages/HomePage.astro"),
    read("src/themes/fuyukawa-kagari/styles/theme.css")
  ].join("\n");
  assert.doesNotMatch(runtime, /live2d|waifu|cubism|modelTexturesId|modelId/i);
  assert.doesNotMatch(runtime, /<aside class="toy-dock"|window\.__yuimiRadio \?\?=/);
});

test("BLOG renders an intentional empty state without fake posts", () => {
  const blog = read("src/themes/fuyukawa-kagari/pages/BlogIndexPage.astro");
  assert.match(blog, /NO NOTES YET/);
  assert.match(blog, /这里暂时没有文章/);
  assert.match(blog, /有想写的再写/);
  assert.match(blog, /暂无文章/);
  assert.match(blog, /blog-empty-plate/);
  assert.match(blog, /kagariAssets\.heroWallpaper/);
});

test("BLOG has a private Markdown authoring workflow without a public editor", () => {
  const schema = read("src/content.config.ts");
  const packageJson = JSON.parse(read("package.json"));
  const generator = read("scripts/new-blog-post.mjs");
  const template = read("src/content/blog/_template.md.example");
  const article = read("src/themes/fuyukawa-kagari/layouts/ArticleLayout.astro");

  assert.equal(packageJson.scripts["blog:new"], "node scripts/new-blog-post.mjs");
  assert.match(generator, /draft: true/);
  assert.match(template, /draft: true/);
  assert.match(schema, /coverAlt: z\.string\(\)\.optional\(\)/);
  assert.match(article, /frontmatter\.cover/);
  assert.match(article, /\.prose img/);
  assert.doesNotMatch(generator, /fetch\(|login|password/i);
});

test("Sites worker serves the custom 404 document without redirecting", () => {
  const worker = read("worker/index.js");
  assert.match(worker, /new URL\("\/404\.html", request\.url\)/);
  assert.match(worker, /ASSETS\.fetch\(new Request\(fallbackUrl\)\)/);
  assert.match(worker, /status:\s*404/);
  assert.doesNotMatch(worker, /redirect/i);
});

test("Sites package excludes inherited assets that are no longer public", () => {
  const packaging = read("scripts/prepare-sites.mjs");
  assert.match(packaging, /dist\/client\/blog-covers/);
  assert.match(packaging, /dist\/client\/themes\/kisara/);
});

test("static asset routing falls back to the custom 404 document", () => {
  assert.equal(read("public/_redirects").trim(), "/* /404.html 404");
});
