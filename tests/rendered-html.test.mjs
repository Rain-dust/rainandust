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

test("server-renders the V4 cinematic portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>寻迹沐雨 \/ RAIN_DUST<\/title>/i);
  assert.match(html, /SCROLL TO WAKE/);
  assert.match(html, /EARTH ONLINE/);
  assert.match(html, /浮生录/);
  assert.match(html, /CAMPUS REIMBURSE KIT/);
  assert.match(html, /知微/);
  assert.match(html, /ALL WORKS \/ ORBIT/);
  assert.match(html, /AI-NATIVE CREATOR/);
  assert.match(html, /github\.com\/Rain-dust\/earth-online/);
});

test("keeps the V4 scroll timeline and shared-master constraints", async () => {
  const [page, css, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /type SourceRect/);
  assert.match(page, /function shardBackground/);
  assert.match(page, /backgroundSize/);
  assert.match(page, /earth-master\.webp/);
  assert.match(page, /reimburse-master-placeholder\.webp/);
  assert.match(page, /window\.scrollY/);
  assert.match(page, /ArrowDown/);
  assert.match(page, /scrollToProgress/);
  assert.match(css, /\.scroll-track\s*\{[^}]*height:\s*1000dvh/s);
  assert.match(css, /\.cinematic-stage\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.eidolon-shard/);
  assert.match(css, /perspective:\s*1400px/);
  assert.match(css, /translate:\s*-50%\s+-50%/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(layout, /lang="zh-CN"/);
});
