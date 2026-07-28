import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const pixelmatchModule = require("pixelmatch");
const pixelmatch = pixelmatchModule.default ?? pixelmatchModule;
const sharp = require("sharp");

const localBase = process.env.YUIMI_LOCAL_URL ?? "http://127.0.0.1:4322";
const upstreamBase = process.env.YUIMI_UPSTREAM_URL ?? "https://yuimi-chaya.github.io";
const executablePath = process.env.YUIMI_CHROMIUM_EXECUTABLE ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.resolve("artifacts/yuimi-release-candidate/visual-diff");

const pages = [
  ["home", "/"],
  ["blog", "/blog/"],
  ["works", "/projects/"],
  ["me", "/about/"]
];
const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["laptop", { width: 1024, height: 768 }],
  ["tablet", { width: 768, height: 1024 }],
  ["mobile", { width: 390, height: 844 }]
];

const stabilizationCss = `
  *, *::before, *::after {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  main img, main video, canvas, #waifu, .sakura-petal,
  [data-home-date], [data-home-time], [data-home-weather],
  [data-elapsed-from], [data-terminal-typing], [data-name-typing] {
    visibility: hidden !important;
  }
  [data-hero-copy], [data-hero-profile],
  .works-shell :is(h1, h2, h3, p, a, button, span),
  .about-profile-shell :is(h1, h2, h3, p, a, li, span) {
    color: transparent !important;
    text-shadow: none !important;
  }
  main .hero-stage {
    background: #f1f1f1 !important;
  }
  main .hero-stage > * {
    visibility: hidden !important;
  }
`;

const normalizePng = (buffer, width, height) => {
  const source = PNG.sync.read(buffer);
  if (source.width === width && source.height === height) return source;
  const target = new PNG({ width, height });
  target.data.fill(255);
  PNG.bitblt(source, target, 0, 0, Math.min(source.width, width), Math.min(source.height, height), 0, 0);
  return target;
};

const capture = async (browser, base, route, viewport, prefix) => {
  const context = await browser.newContext({
    viewport,
    reducedMotion: "reduce",
    colorScheme: "light"
  });
  const page = await context.newPage();
  await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(700);
  const backdrop = page.locator("[data-notice-backdrop]");
  if (await backdrop.count() && await backdrop.evaluate((node) => node.classList.contains("is-open"))) {
    await page.locator("[data-notice-close]").click({ force: true });
    await page.waitForFunction(() => !document.querySelector("[data-notice-backdrop]")?.classList.contains("is-open"));
  }
  await page.screenshot({ path: `${prefix}-first.png` });
  await page.screenshot({ path: `${prefix}-full.png`, fullPage: true });
  await page.addStyleTag({ content: stabilizationCss });
  await page.evaluate(() => window.scrollTo(0, 0));
  const stable = await page.screenshot();
  await context.close();
  return stable;
};

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath, args: ["--autoplay-policy=no-user-gesture-required"] });
const results = [];

for (const [pageName, route] of pages) {
  for (const [viewportName, viewport] of viewports) {
    const stem = `${pageName}-${viewportName}`;
    const localPrefix = path.join(outputDir, `${stem}-local`);
    const upstreamPrefix = path.join(outputDir, `${stem}-upstream`);
    const localBuffer = await capture(browser, localBase, route, viewport, localPrefix);
    const upstreamBuffer = await capture(browser, upstreamBase, route, viewport, upstreamPrefix);
    const width = Math.max(PNG.sync.read(localBuffer).width, PNG.sync.read(upstreamBuffer).width);
    const height = Math.max(PNG.sync.read(localBuffer).height, PNG.sync.read(upstreamBuffer).height);
    const localPng = normalizePng(localBuffer, width, height);
    const upstreamPng = normalizePng(upstreamBuffer, width, height);
    const diff = new PNG({ width, height });
    const changed = pixelmatch(localPng.data, upstreamPng.data, diff.data, width, height, {
      threshold: 0.14,
      includeAA: false,
      alpha: 0.65,
      diffColor: [220, 32, 72]
    });
    const diffBuffer = PNG.sync.write(diff);
    const diffPath = path.join(outputDir, `${stem}-diff.png`);
    await fs.writeFile(diffPath, diffBuffer);
    const triptychPath = path.join(outputDir, `${stem}-triptych.png`);
    await sharp({
      create: {
        width: width * 3,
        height,
        channels: 4,
        background: "#ffffff"
      }
    }).composite([
      { input: PNG.sync.write(localPng), left: 0, top: 0 },
      { input: PNG.sync.write(upstreamPng), left: width, top: 0 },
      { input: diffBuffer, left: width * 2, top: 0 }
    ]).png().toFile(triptychPath);
    results.push({
      page: pageName,
      route,
      viewport: viewportName,
      dimensions: `${viewport.width}x${viewport.height}`,
      changedPixels: changed,
      comparedPixels: width * height,
      differenceRatio: Number((changed / (width * height)).toFixed(6)),
      localFirst: path.relative(process.cwd(), `${localPrefix}-first.png`),
      localFull: path.relative(process.cwd(), `${localPrefix}-full.png`),
      upstreamFirst: path.relative(process.cwd(), `${upstreamPrefix}-first.png`),
      upstreamFull: path.relative(process.cwd(), `${upstreamPrefix}-full.png`),
      triptych: path.relative(process.cwd(), triptychPath)
    });
    console.log(`${stem}: ${(changed / (width * height) * 100).toFixed(2)}%`);
  }
}

await browser.close();
await fs.writeFile(path.join(outputDir, "visual-diff-results.json"), `${JSON.stringify({
  localBase,
  upstreamBase,
  masks: "identity, content data, media, canvases, clock/weather/timers, typing and animation",
  results
}, null, 2)}\n`);
