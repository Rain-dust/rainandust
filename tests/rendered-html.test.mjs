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

test("server-renders the V3 single-viewport portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>寻辰沐雨 \/ RAIN_DUST<\/title>/i);
  assert.match(html, /ENTER SPACE/);
  assert.match(html, /CAMPUS REIMBURSE KIT/);
  assert.match(html, /class="project-focus"/);
  assert.match(html, /AI-NATIVE/);
  assert.match(html, /CREATOR/);
  assert.match(html, /github\.com\/Rain-dust\/earth-online/);
  assert.doesNotMatch(html, /ARCHIVE \/ NOTES|DIGITAL INTERLUDE|codex-preview/i);
});

test("keeps the V3 interaction and visual constraints", async () => {
  const [page, css, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /type PortfolioState = "opening" \| "workspace" \| "project-focus" \| "info"/);
  assert.match(page, /type Shard =/);
  assert.match(page, /handleWheel|handleTouchEnd|ArrowRight|Escape/);
  assert.match(page, /github\.com\/Rain-dust\/Zhi-Wei/);
  assert.match(css, /html,\s*\nbody\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.glass-shard/);
  assert.match(page, /clipPath/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.hair-5/);
  assert.match(layout, /lang="zh-CN"/);
});
