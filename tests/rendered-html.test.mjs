import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the rebuilt Rain Dust portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /寻辰沐雨/);
  assert.match(html, /Selected work/);
  assert.match(html, /Earth Online/);
  assert.match(html, /浮生录/);
  assert.match(html, /知微/);
  assert.match(html, /Campus Reimburse Kit/);
  assert.match(html, /刚才什么也没有发生/);
  assert.doesNotMatch(html, /RELIC 01|SCROLL TO ERODE|COLLAPSE/);
});

test("keeps the shadow-led, non-card, reduced-motion constraints", async () => {
  const [page, css, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /hero-girl-reveal-v2\.webp/);
  assert.match(page, /IntersectionObserver/);
  assert.match(page, /AudioContext/);
  assert.match(page, /github\.com\/Rain-dust\/earth-online/);
  assert.match(page, /github\.com\/Rain-dust\/fushenglu/);
  assert.match(page, /github\.com\/Rain-dust\/Zhi-Wei/);
  assert.match(css, /\.shadow-origin/);
  assert.match(css, /\.works-editorial/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(page, /NightRelicCanvas|RELIC_TOPOLOGY/);
  assert.doesNotMatch(css, /\.card\b|glassmorphism/);
  assert.match(layout, /lang="zh-CN"/);
});
