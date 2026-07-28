import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const indexUrl = new URL("../dist/client/index.html", import.meta.url);

test("Astro emits the Rain Dust portfolio as content-first HTML", async () => {
  const html = await readFile(indexUrl, "utf8");

  assert.match(html, /寻辰沐雨/);
  assert.match(html, /Earth Online/);
  assert.match(html, /浮生录/);
  assert.match(html, /知微/);
  assert.match(html, /Campus Reimburse Kit/);
  assert.match(html, /data-project-field/);
  assert.doesNotMatch(html, /SOUND OFF|girl-reveal|Three things I chose/);
});

test("the Sites worker delegates requests to the static asset binding", async () => {
  const html = await readFile(indexUrl, "utf8");
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(new Request("https://portfolio.test/"), {
    ASSETS: {
      fetch: async () =>
        new Response(html, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    },
  });

  assert.equal(response.status, 200);
  assert.match(await response.text(), /RAIN_DUST/);
});

test("the compiled page keeps motion and accessibility fallbacks", async () => {
  const html = await readFile(indexUrl, "utf8");
  const stylesheet = html.match(/href="([^"]+\.css)"/)?.[1];
  assert.ok(stylesheet, "expected a compiled stylesheet");

  const cssUrl = new URL(`../dist/client${stylesheet}`, import.meta.url);
  const css = await readFile(cssUrl, "utf8");

  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.skip-link/);
  assert.match(css, /\.project-field__signal/);
  assert.doesNotMatch(css, /\.card\b|glassmorphism|#6366f1/i);
});
