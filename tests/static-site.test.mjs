import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const indexUrl = new URL("../dist/client/index.html", import.meta.url);

test("Astro emits the video-led HOME and four route entrances", async () => {
  const html = await readFile(indexUrl, "utf8");

  assert.match(html, /寻辰沐雨/);
  assert.match(html, /Rain_dust/);
  assert.match(html, /Vibe Coder/);
  assert.match(html, /shadow-home-loop\.mp4/);
  assert.match(html, /home-hero__stage/);
  assert.match(html, /播放动态背景/);
  assert.match(html, /HOME/);
  assert.match(html, /BLOG/);
  assert.match(html, /WORKS/);
  assert.match(html, /ME/);
  assert.doesNotMatch(html, /hero-girl|data-project-field|向下滚动/);
});

test("each top-level room is emitted as an independent page", async () => {
  const rooms = [
    ["blog", /笔记暂时留白/],
    ["works", /塔罗牌桌/],
    ["me", /个人设定集/],
  ];

  for (const [route, content] of rooms) {
    const html = await readFile(
      new URL(`../dist/client/${route}/index.html`, import.meta.url),
      "utf8",
    );

    assert.match(html, content);
    assert.match(html, /data-portal-shell/);
    assert.match(html, /scene-curtain/);
  }
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
  assert.match(await response.text(), /Rain_dust/);
});

test("the compiled site keeps motion, navigation, and accessibility fallbacks", async () => {
  const html = await readFile(indexUrl, "utf8");
  const stylesheet = html.match(/href="([^"]+\.css)"/)?.[1];
  assert.ok(stylesheet, "expected a compiled stylesheet");

  const cssUrl = new URL(`../dist/client${stylesheet}`, import.meta.url);
  const css = await readFile(cssUrl, "utf8");

  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.skip-link/);
  assert.match(css, /\.portal-pull/);
  assert.match(css, /\.scene-curtain/);
  assert.match(css, /\.home-hero__video/);
  assert.match(css, /object-fit:\s*contain/);
  assert.match(css, /\.home-motion-toggle/);
  assert.doesNotMatch(css, /\.card\b|glassmorphism|#6366f1/i);
});
