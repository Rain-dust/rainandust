import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("HOME video keeps the upstream autoplay lifecycle attributes", () => {
  const home = read("src/themes/fuyukawa-kagari/pages/HomePage.astro");
  for (const attribute of ["autoplay", "muted", "loop", "playsinline", "data-home-hero-video"]) {
    assert.match(home, new RegExp(`\\b${attribute}\\b`));
  }
  assert.match(home, /prefers-reduced-motion:\s*reduce/);
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
