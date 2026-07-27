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

test("server-renders the V6 Phase A portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /DAY MASK \/ NIGHT SELF/);
  assert.match(html, /于无声处/);
  assert.match(html, /SCROLL TO ERODE/);
  assert.match(html, /EARTH ONLINE/);
  assert.match(html, /COLLAPSE/);
  assert.match(html, /github\.com\/Rain-dust\/earth-online/);
  assert.doesNotMatch(html, /ALL WORKS \/ ORBIT/);
});

test("keeps the V6 fixed-stage, WebGL topology, and fallback constraints", async () => {
  const [page, css, layout, canvas, topology] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/night-relic-canvas.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/relic-topology.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /progressRef/);
  assert.match(page, /window\.scrollY/);
  assert.match(page, /ArrowDown/);
  assert.match(page, /webglFallback/);
  assert.match(page, /motion"\) === "full"/);
  assert.match(page, /NightRelicCanvas/);
  assert.match(css, /\.scroll-track\s*\{[^}]*height:\s*900dvh/s);
  assert.match(css, /\.cinematic-stage\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(canvas, /new THREE\.WebGLRenderer/);
  assert.match(canvas, /new THREE\.ExtrudeGeometry/);
  assert.match(canvas, /new EffectComposer/);
  assert.match(canvas, /renderer\.setPixelRatio/);
  assert.match(canvas, /renderer\.compile/);
  assert.match(canvas, /textureLoader\.load/);
  assert.match(topology, /RELIC_TOPOLOGY_SEED/);
  assert.equal((topology.match(/id: "relic-/g) ?? []).length, 12);
  assert.match(topology, /privateTraces: PrivateTrace\[\] = \[\]/);
  assert.match(layout, /lang="zh-CN"/);
});
