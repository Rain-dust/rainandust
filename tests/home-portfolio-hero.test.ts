import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync(
  new URL("../src/themes/fuyukawa-kagari/pages/HomePage.astro", import.meta.url),
  "utf8"
);

const count = (pattern: RegExp) => home.match(pattern)?.length ?? 0;

test("HOME presents the approved Creative Engineer identity", () => {
  assert.match(home, /portfolioRoleLine/);
  assert.match(home, /CREATIVE ENGINEER/);
  assert.match(home, /INDEPENDENT BUILDER/);
  assert.match(home, /CREATIVE VIBECODER/);
  assert.doesNotMatch(home, /Personal site \/ Anime & code/i);
});

test("HOME exposes verified contact actions and the WORKS rift", () => {
  assert.match(home, /href=\{profileIdentity\.github\}/);
  assert.match(home, /href=\{profileIdentity\.email\}/);
  assert.match(home, /href="\/projects\/"/);
  assert.match(home, /aria-label="Execute Works"/);
});

test("HOME status terminal communicates the current work", () => {
  assert.match(home, /STATUS/);
  assert.match(home, /ACTIVE/);
  for (const status of [
    "推进自瞄算法迭代",
    "优化 Earth Online",
    "为 AstrBot 编写插件",
    "利用 Obsidian 搭建自我预测模型"
  ]) {
    assert.match(home, new RegExp(status));
  }
});

test("HOME owns one reversible and cleaned-up wheel narrative", () => {
  assert.equal(count(/class="hero-profile identity-card"/g), 1);
  assert.equal(count(/class="hero-story identity-terminal-extension"/g), 1);
  assert.equal(count(/class="identity-rift"/g), 1);
  assert.match(home, /window\.__yuimiHeroCleanup\?\.\(\)/);
  assert.match(home, /addEventListener\("wheel", handleHeroWheel, \{ passive: false \}\)/);
  assert.match(home, /removeEventListener\("wheel", handleHeroWheel\)/);
  assert.match(home, /requestAnimationFrame/);
  assert.match(home, /cancelAnimationFrame/);
  assert.match(home, /prefers-reduced-motion:\s*reduce/);
});

test("HOME keeps the profile, extension, and rift in a coherent DOM sequence", () => {
  const avatar = home.indexOf('class="identity-avatar"');
  const terminal = home.indexOf('class="identity-terminal"');
  const extension = home.indexOf('class="hero-story identity-terminal-extension"');
  const rift = home.indexOf('class="identity-rift"');

  assert.ok(avatar > -1 && terminal > avatar && extension > terminal && rift > extension);
  assert.match(home, /rain-dust-profile\.exe/);
  assert.match(home, /C:\\Users\\Rain_dust\\profile/);
  assert.match(home, /19-YEAR-OLD/);
  assert.match(home, /GUIKE HACKATHON 2026/);
});
