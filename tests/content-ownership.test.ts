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

test("public profile data contains only the confirmed Rain_dust facts", () => {
  assert.deepEqual(profileTech.map(({ key }) => key), [
    "threejs",
    "pwa",
    "python",
    "nextjs",
    "javascript"
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
    "quiet-mystery",
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

test("inherited articles and their production-only assets are absent", () => {
  const blogDirectory = new URL("src/content/blog/", root);
  const markdown = existsSync(blogDirectory)
    ? readdirSync(blogDirectory).filter((name) => name.endsWith(".md"))
    : [];
  assert.deepEqual(markdown, []);
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
  assert.match(runtime, /data-music-toggle/);
});

test("BLOG renders an intentional empty state without fake posts", () => {
  const blog = read("src/themes/fuyukawa-kagari/pages/BlogIndexPage.astro");
  assert.match(blog, /NO NOTES YET/);
  assert.match(blog, /这里暂时没有文章/);
  assert.match(blog, /有想写的再写/);
  assert.match(blog, /暂无文章/);
});

test("Sites worker serves the custom 404 document without redirecting", () => {
  const worker = read("worker/index.js");
  assert.match(worker, /new URL\("\/404\.html", request\.url\)/);
  assert.match(worker, /status:\s*404/);
  assert.doesNotMatch(worker, /redirect/i);
});

test("Sites package excludes inherited assets that are no longer public", () => {
  const packaging = read("scripts/prepare-sites.mjs");
  assert.match(packaging, /dist\/client\/blog-covers/);
  assert.match(packaging, /dist\/client\/themes\/kisara/);
});
