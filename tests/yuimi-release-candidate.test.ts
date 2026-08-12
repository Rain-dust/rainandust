import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("HOME keeps the current static hero and accessible motion fallback", () => {
  const home = read("src/themes/fuyukawa-kagari/pages/HomePage.astro");
  assert.match(home, /class="hero-stage"/);
  assert.match(home, /class="hero-overlay"/);
  assert.match(home, /data-hero-profile/);
  assert.match(home, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(home, /<video\b|data-home-hero-video/);
});

test("the retired pink pig is no longer rendered anywhere in the public shell or HOME", () => {
  const home = read("src/themes/fuyukawa-kagari/pages/HomePage.astro");
  const layout = read("src/themes/fuyukawa-kagari/layouts/BaseLayout.astro");
  const assets = read("src/themes/fuyukawa-kagari/assets.ts");

  for (const source of [home, layout, assets]) {
    assert.doesNotMatch(source, /mini-pig-scroll|pig-brand|pig-favicon|pig-apple-touch/);
  }
  assert.doesNotMatch(home, /makePig|drawPig|type:\s*"pig"/);
});

test("all six factual project repository URLs are present", () => {
  const projects = read("src/core/data/projects.ts");
  const urls = [
    "https://github.com/Rain-dust/earth-online",
    "https://github.com/Rain-dust/fushenglu",
    "https://github.com/Rain-dust/MindCache",
    "https://github.com/Rain-dust/campus-reimburse-kit",
    "https://github.com/Rain-dust/Zhi-Wei",
    "https://github.com/Rain-dust?tab=repositories"
  ];
  for (const url of urls) assert.match(projects, new RegExp(url.replace(/[.?]/g, "\\$&")));
});

test("GAME pages and data remain removed from every theme", () => {
  const removed = [
    "src/core/data/games.ts",
    "src/pages/games.astro",
    "src/pages/themes/blank/games.astro",
    "src/pages/themes/kisara/games.astro",
    "src/themes/blank/pages/GamesPage.astro",
    "src/themes/fuyukawa-kagari/pages/GamesPage.astro",
    "src/themes/kisara/pages/GamesPage.astro",
    "src/themes/kisara/styles/games.css",
    "public/themes/kisara/games/2048/index.html"
  ];
  for (const file of removed) assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), false, file);
});

test("legacy WORKS and ME aliases remain static compatibility redirects", () => {
  assert.match(read("src/pages/works.astro"), /\/projects\//);
  assert.match(read("src/pages/me.astro"), /\/about\//);
});
