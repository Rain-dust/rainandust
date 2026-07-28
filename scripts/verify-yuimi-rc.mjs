import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const baseUrl = process.env.YUIMI_BASE_URL ?? "http://127.0.0.1:4322";
const executablePath = process.env.YUIMI_CHROMIUM_EXECUTABLE
  ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.resolve(process.env.YUIMI_RC_OUTPUT ?? "artifacts/yuimi-release-candidate");
const motionDir = path.join(outputDir, "motion");
const matrix = [];
const runtime = {
  browser: "Chromium",
  executablePath,
  baseUrl,
  generatedAt: new Date().toISOString(),
  video: [],
  lifecycle: [],
  consoleErrors: [],
  networkFailures: []
};

await fs.mkdir(motionDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ["--autoplay-policy=no-user-gesture-required"]
});

const record = async (feature, viewport, theme, action, expected, evidence, run) => {
  try {
    const actual = await run();
    matrix.push({ feature, viewport, theme, action, expected, actual, evidence, status: "PASS" });
    return actual;
  } catch (error) {
    matrix.push({
      feature,
      viewport,
      theme,
      action,
      expected,
      actual: error instanceof Error ? error.message : String(error),
      evidence,
      status: "FAIL"
    });
    return null;
  }
};

const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const attachDiagnostics = (page, label) => {
  page.on("pageerror", (error) => runtime.consoleErrors.push({ label, type: "pageerror", message: error.message }));
  page.on("console", (message) => {
    if (message.type() === "error") runtime.consoleErrors.push({ label, type: "console", message: message.text() });
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (url.startsWith(baseUrl)) {
      runtime.networkFailures.push({ label, url, error: request.failure()?.errorText ?? "unknown" });
    }
  });
};

const closeNotice = async (page) => {
  const notice = page.locator("[data-notice-backdrop]");
  if (await notice.count() && await notice.evaluate((node) => node.classList.contains("is-open"))) {
    await page.locator("[data-notice-close]").click({ force: true });
    await page.waitForFunction(() => !document.querySelector("[data-notice-backdrop]")?.classList.contains("is-open"));
  }
};

const videoState = (page) => page.locator("[data-home-hero-video]").evaluate((video) => {
  const rect = video.getBoundingClientRect();
  return {
    count: document.querySelectorAll("[data-home-hero-video]").length,
    autoplay: video.autoplay,
    muted: video.muted,
    defaultMuted: video.defaultMuted,
    loop: video.loop,
    playsInline: video.playsInline,
    readyState: video.readyState,
    paused: video.paused,
    currentTime: video.currentTime,
    duration: video.duration,
    videoWidth: video.videoWidth,
    videoHeight: video.videoHeight,
    currentSrc: video.currentSrc,
    display: getComputedStyle(video).display,
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    mediaState: video.closest("[data-hero-stage]")?.dataset.mediaState ?? ""
  };
});

const testMotion = async ({ name, viewport }) => {
  const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
  const page = await context.newPage();
  attachDiagnostics(page, `motion-${name}`);
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await closeNotice(page);
  const video = page.locator("[data-home-hero-video]");
  await video.waitFor({ state: "attached" });
  await page.waitForFunction(() => {
    const target = document.querySelector("[data-home-hero-video]");
    return target && target.readyState >= 2 && !target.paused;
  }, { timeout: 15_000 });

  const initial = await videoState(page);
  expect(initial.count === 1, `${name}: expected one HOME video`);
  expect(initial.autoplay && initial.muted && initial.defaultMuted && initial.loop && initial.playsInline, `${name}: media flags missing`);
  expect(initial.readyState >= 2 && !initial.paused, `${name}: video is not playing`);

  const frames = [];
  for (const target of [0.5, 5, 9.5]) {
    await page.waitForFunction((threshold) => {
      const item = document.querySelector("[data-home-hero-video]");
      return item && item.currentTime >= threshold;
    }, target, { timeout: 15_000 });
    const state = await videoState(page);
    const file = path.join(motionDir, `${name}-${String(target).replace(".", "_")}s.png`);
    await page.screenshot({ path: file });
    frames.push({ target, state, file: path.relative(outputDir, file).replaceAll("\\", "/") });
  }

  let previous = frames.at(-1).state.currentTime;
  let wrapped = false;
  const wrapDeadline = Date.now() + 5_000;
  while (Date.now() < wrapDeadline) {
    const current = (await videoState(page)).currentTime;
    if (previous > 8 && current < 2) {
      wrapped = true;
      const file = path.join(motionDir, `${name}-10_5s-wrap.png`);
      await page.screenshot({ path: file });
      frames.push({ target: "wrap", state: await videoState(page), file: path.relative(outputDir, file).replaceAll("\\", "/") });
      break;
    }
    previous = current;
    await page.waitForTimeout(50);
  }
  expect(wrapped, `${name}: video did not wrap at the ten-second boundary`);

  const progressStart = (await videoState(page)).currentTime;
  await page.waitForTimeout(2_000);
  const progressEnd = (await videoState(page)).currentTime;
  const progressDelta = progressEnd >= progressStart
    ? progressEnd - progressStart
    : initial.duration - progressStart + progressEnd;
  expect(progressDelta > 1.5, `${name}: currentTime did not advance for two seconds`);

  const result = { name, viewport, initial, progressStart, progressEnd, progressDelta, wrapped, frames };
  runtime.video.push(result);
  await context.close();
  return result;
};

for (const config of [
  { name: "desktop", viewport: { width: 1440, height: 900 } },
  { name: "mobile", viewport: { width: 390, height: 844 } }
]) {
  await record(
    "HOME video",
    config.name,
    "Fuyukawa Kagari",
    "Autoplay, advance for two seconds, capture four frames and wrap",
    "One muted inline video plays and loops at about ten seconds",
    `motion/${config.name}-*.png`,
    () => testMotion(config)
  );
}

for (const config of [
  { name: "desktop-reduced", viewport: { width: 1440, height: 900 } },
  { name: "mobile-reduced", viewport: { width: 390, height: 844 } }
]) {
  await record(
    "Reduced motion",
    config.name,
    "Fuyukawa Kagari",
    "Load HOME with reducedMotion=reduce",
    "Video is paused/fallback and core layout remains usable",
    `motion/${config.name}.png`,
    async () => {
      const context = await browser.newContext({ viewport: config.viewport, reducedMotion: "reduce" });
      const page = await context.newPage();
      attachDiagnostics(page, config.name);
      await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
      await closeNotice(page);
      const state = await videoState(page);
      const layout = await page.evaluate(() => ({
        main: Boolean(document.querySelector("main")),
        navLinks: document.querySelectorAll("nav[aria-label='Main navigation'] a").length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      }));
      const file = path.join(motionDir, `${config.name}.png`);
      await page.screenshot({ path: file });
      expect(state.paused && state.mediaState === "fallback", `${config.name}: reduced-motion fallback not active`);
      expect(layout.main && layout.navLinks === 4 && !layout.overflow, `${config.name}: reduced layout unusable`);
      await context.close();
      return { state, layout };
    }
  );
}

const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
const page = await context.newPage();
attachDiagnostics(page, "interaction-desktop");

await record(
  "Global navigation",
  "1440x900",
  "Fuyukawa Kagari",
  "Hover the top trigger and inspect active navigation",
  "Header reveals, four links remain keyboard reachable, HOME is active",
  "interaction-matrix.json",
  async () => {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await closeNotice(page);
    await page.mouse.move(720, 6);
    await page.waitForFunction(() => document.querySelector(".site-header")?.getBoundingClientRect().y > -5);
    const result = await page.evaluate(() => ({
      headerY: document.querySelector(".site-header")?.getBoundingClientRect().y,
      links: document.querySelectorAll("nav[aria-label='Main navigation'] a").length,
      homeHref: document.querySelector("nav[aria-label='Main navigation'] a")?.getAttribute("href"),
      focusVisibleRules: [...document.styleSheets].some((sheet) => {
        try { return [...sheet.cssRules].some((rule) => rule.cssText.includes(":focus-visible")); } catch { return false; }
      })
    }));
    expect(result.headerY >= -5 && result.links === 4 && result.homeHref === "/" && result.focusVisibleRules, "navigation reveal/active/focus contract failed");
    return result;
  }
);

await record(
  "Tool dock, scrollbar, canvas and footer",
  "1440x900",
  "Fuyukawa Kagari",
  "Open dock, scroll page and inspect persistent widgets",
  "Dock pins, pig scrollbar and canvases exist, footer timers update",
  "interaction-matrix.json",
  async () => {
    await page.locator(".toy-dock-handle").click();
    await page.evaluate(() => window.scrollTo(0, 650));
    await page.waitForFunction(() => [...document.querySelectorAll("[data-elapsed-from]")].every((node) => !node.textContent?.includes("计算中")));
    const result = await page.evaluate(() => ({
      dockPinned: document.querySelector(".toy-dock")?.classList.contains("is-pinned"),
      pigScrollbar: Boolean(document.querySelector("[data-pig-scrollbar]")),
      tagCanvas: Boolean(document.querySelector("[data-tag-rain-canvas]")),
      live2dState: document.querySelector("[data-live2d-status]")?.textContent?.trim(),
      timersReady: [...document.querySelectorAll("[data-elapsed-from]")].every((node) => !node.textContent?.includes("计算中")),
      consoleSignal: typeof window.rainDustSignal
    }));
    expect(
      result.dockPinned && result.pigScrollbar && result.tagCanvas && result.live2dState && result.timersReady && result.consoleSignal === "function",
      `persistent widget check failed: ${JSON.stringify(result)}`
    );
    return result;
  }
);

await record(
  "Custom context menu and theme mapping",
  "1440x900",
  "Fuyukawa Kagari → Blank → Kisara",
  "Open right-click menu, verify bounds, select themes and route mapping",
  "Menu stays in viewport and theme routes map to the current page",
  "interaction-matrix.json",
  async () => {
    await page.goto(`${baseUrl}/about/`, { waitUntil: "domcontentloaded" });
    await page.mouse.click(1100, 650, { button: "right" });
    const menu = page.locator("[data-context-menu]");
    await menu.waitFor({ state: "visible" });
    const box = await menu.boundingBox();
    expect(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= 1440 && box.y + box.height <= 900, "context menu escaped viewport");
    await menu.locator("[data-theme-select='blank']").click();
    await page.waitForURL("**/themes/blank/about/");
    await page.mouse.click(1100, 650, { button: "right" });
    await page.locator("[data-blank-context-menu] [data-theme-select='kisara']").click();
    await page.waitForURL("**/themes/kisara/about/");
    const result = { menuBox: box, finalUrl: page.url(), theme: await page.locator("html").getAttribute("data-theme") };
    expect(result.theme === "kisara", "Kisara theme did not activate");
    await page.evaluate(() => window.__yuimiTheme?.select("fuyukawa-kagari"));
    await page.waitForURL("**/about/");
    return result;
  }
);

await record(
  "Notice, typing, scroll cue, profile and avatar",
  "1440x900",
  "Fuyukawa Kagari",
  "Open/close notice, observe typing, use scroll cue and poke avatar",
  "All HOME interactions respond once and preserve layout",
  "interaction-matrix.json",
  async () => {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await closeNotice(page);
    const trigger = page.locator("[data-notice-open]");
    await trigger.click();
    await page.waitForFunction(() => document.querySelector("[data-notice-backdrop]")?.classList.contains("is-open"));
    await page.locator("[data-notice-close]").click();
    await page.waitForFunction(() => !document.querySelector("[data-notice-backdrop]")?.classList.contains("is-open"));
    await page.waitForFunction(() => (document.querySelector("[data-terminal-typing]")?.textContent?.length ?? 0) > 2);
    const beforeScroll = await page.evaluate(() => window.scrollY);
    await page.getByRole("link", { name: "Scroll to content" }).dispatchEvent("click");
    await page.waitForFunction(() => window.scrollY > 100);
    await page.locator("[data-poke-avatar]").dblclick({ force: true });
    const result = await page.evaluate((before) => ({
      typing: document.querySelector("[data-terminal-typing]")?.textContent,
      beforeScroll: before,
      afterScroll: window.scrollY,
      profilePosition: getComputedStyle(document.querySelector("[data-hero-profile]")).position,
      pokeVisible: document.querySelector("[data-poke-bubble]")?.classList.contains("is-visible"),
      tagCanvas: Boolean(document.querySelector("[data-tag-rain-canvas]")),
      weather: document.querySelector("[data-home-weather]")?.textContent
    }), beforeScroll);
    expect(result.afterScroll > 100 && result.pokeVisible && result.tagCanvas && result.weather, "HOME interaction check failed");
    return result;
  }
);

await record(
  "Music and route lifecycle",
  "1440x900",
  "Fuyukawa Kagari",
  "Play music and navigate HOME ↔ BLOG three times with Astro navigation",
  "One dock/audio controller persists without duplicate video or canvas",
  "interaction-matrix.json",
  async () => {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await closeNotice(page);
    if (!await page.locator(".toy-dock").evaluate((node) => node.classList.contains("is-pinned"))) {
      await page.locator(".toy-dock-handle").click();
    }
    await page.locator("[data-music-toggle]").click();
    await page.waitForFunction(() => document.querySelector("[data-music-toggle]")?.textContent?.includes("Ⅱ"));
    const states = [];
    for (let cycle = 0; cycle < 3; cycle += 1) {
      await page.locator("nav[aria-label='Main navigation'] a[href='/blog/']").dispatchEvent("click");
      await page.waitForURL("**/blog/");
      states.push(await page.evaluate(() => ({
        route: location.pathname,
        docks: document.querySelectorAll(".toy-dock").length,
        videos: document.querySelectorAll("[data-home-hero-video]").length,
        tagCanvases: document.querySelectorAll("[data-tag-rain-canvas]").length,
        musicPlaying: document.querySelector("[data-music-toggle]")?.textContent?.includes("Ⅱ"),
        audioCurrentTime: window.__yuimiRadio?.audio?.currentTime ?? -1
      })));
      await page.locator("nav[aria-label='Main navigation'] a[href='/']").dispatchEvent("click");
      await page.waitForURL(`${baseUrl}/`);
      await closeNotice(page);
      states.push(await page.evaluate(() => ({
        route: location.pathname,
        docks: document.querySelectorAll(".toy-dock").length,
        videos: document.querySelectorAll("[data-home-hero-video]").length,
        tagCanvases: document.querySelectorAll("[data-tag-rain-canvas]").length,
        musicPlaying: document.querySelector("[data-music-toggle]")?.textContent?.includes("Ⅱ"),
        audioCurrentTime: window.__yuimiRadio?.audio?.currentTime ?? -1
      })));
    }
    expect(states.every((state) => state.docks === 1), "dock duplicated");
    expect(states.filter((state) => state.route === "/").every((state) => state.videos === 1 && state.tagCanvases === 1), "HOME media duplicated");
    expect(states.filter((state) => state.route !== "/").every((state) => state.videos === 0 && state.tagCanvases === 0), "HOME media leaked");
    expect(states.every((state) => state.musicPlaying && state.audioCurrentTime >= 0), "music did not persist");
    runtime.lifecycle = states;
    return states;
  }
);

await record(
  "BLOG search and article",
  "1440x900",
  "Fuyukawa Kagari",
  "Search, clear, open an article and inspect article navigation",
  "Pagefind returns links, clearing empties results, article renders with attribution",
  "interaction-matrix.json",
  async () => {
    await page.goto(`${baseUrl}/blog/`, { waitUntil: "domcontentloaded" });
    const input = page.locator("[data-blog-search]");
    await input.fill("AstrBot");
    await page.waitForFunction(() => document.querySelectorAll("[data-blog-search-results] a").length > 0);
    const count = await page.locator("[data-blog-search-results] a").count();
    const href = await page.locator("[data-blog-search-results] a").first().getAttribute("href");
    await input.fill("");
    await page.waitForFunction(() => document.querySelector("[data-blog-search-results]")?.children.length === 0);
    await page.goto(`${baseUrl}${href}`, { waitUntil: "domcontentloaded" });
    const article = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim(),
      article: Boolean(document.querySelector("article")),
      authorAttribution: document.body.innerText.includes("喝益胃") || document.body.innerText.includes("Yuimi-chaya"),
      codeBlocks: document.querySelectorAll("pre, .expressive-code").length
    }));
    expect(count > 0 && article.article && article.h1 && article.authorAttribution, "BLOG search/article contract failed");
    return { count, href, article };
  }
);

await record(
  "BLOG local fallback",
  "1440x900",
  "Fuyukawa Kagari",
  "Block Pagefind runtime and search locally",
  "Local fallback returns matching article links",
  "interaction-matrix.json",
  async () => {
    const fallbackContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await fallbackContext.route("**/pagefind/**", (route) => route.abort());
    const fallbackPage = await fallbackContext.newPage();
    await fallbackPage.goto(`${baseUrl}/blog/`, { waitUntil: "domcontentloaded" });
    await fallbackPage.locator("[data-blog-search]").fill("AstrBot");
    await fallbackPage.waitForFunction(() => document.querySelectorAll("[data-blog-search-results] a").length > 0);
    const count = await fallbackPage.locator("[data-blog-search-results] a").count();
    await fallbackContext.close();
    expect(count > 0, "local search fallback returned no results");
    return { count };
  }
);

const repositoryUrls = [
  "https://github.com/Rain-dust/earth-online",
  "https://github.com/Rain-dust/fushenglu",
  "https://github.com/Rain-dust/MindCache",
  "https://github.com/Rain-dust/campus-reimburse-kit",
  "https://github.com/Rain-dust/Zhi-Wei",
  "https://github.com/Rain-dust?tab=repositories"
];

await record(
  "WORKS filters, cards and repositories",
  "1440x900",
  "Fuyukawa Kagari",
  "Filter, expand/collapse and inspect six repository links",
  "Filters highlight correct line, cards toggle once, all links are factual GitHub URLs",
  "interaction-matrix.json",
  async () => {
    await page.goto(`${baseUrl}/projects/`, { waitUntil: "domcontentloaded" });
    await page.locator("[data-filter='unity']").click();
    const dimmed = await page.locator("[data-project-line].is-dimmed").count();
    const firstToggle = page.locator("[data-card-toggle]").first();
    await firstToggle.click();
    expect(await firstToggle.getAttribute("aria-expanded") === "true", "project card did not expand");
    await firstToggle.click();
    expect(await firstToggle.getAttribute("aria-expanded") === "false", "project card did not collapse");
    const urls = await page.locator(".works-card-repository").evaluateAll((links) => links.map((link) => link.href));
    const orbit = await page.evaluate(() => ({
      exists: Boolean(document.querySelector(".works-hero-orbit")),
      animation: getComputedStyle(document.querySelector(".works-hero-orbit")).animationName
    }));
    expect(dimmed === 5 && JSON.stringify(urls) === JSON.stringify(repositoryUrls) && orbit.exists, "WORKS matrix failed");
    return { dimmed, urls, orbit };
  }
);

await record(
  "ME content and links",
  "1440x900 + 390x844",
  "Fuyukawa Kagari",
  "Inspect sticky profile, circular avatar, content blocks and mobile overflow",
  "ME structure is intact and Rain_dust links remain reachable",
  "interaction-matrix.json",
  async () => {
    await page.goto(`${baseUrl}/about/`, { waitUntil: "domcontentloaded" });
    const desktop = await page.evaluate(() => ({
      sticky: getComputedStyle(document.querySelector(".about-sidebar")).position,
      avatarRadius: getComputedStyle(document.querySelector(".about-avatar-card img")).borderRadius,
      headings: [...document.querySelectorAll("h2")].map((node) => node.textContent?.trim()),
      github: document.querySelector("a[href='https://github.com/Rain-dust']")?.href,
      email: document.querySelector("a[href^='mailto:']")?.getAttribute("href")
    }));
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(`${baseUrl}/about/`, { waitUntil: "domcontentloaded" });
    const mobileLayout = await mobilePage.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      githubVisible: Boolean(document.querySelector("a[href='https://github.com/Rain-dust']")),
      emailVisible: Boolean(document.querySelector("a[href^='mailto:']"))
    }));
    await mobile.close();
    expect(desktop.sticky === "sticky" && desktop.github && desktop.email === "mailto:1223451146@qq.com" && !mobileLayout.overflow, "ME contract failed");
    return { desktop, mobile: mobileLayout };
  }
);

await record(
  "Routes, history and 404",
  "1440x900",
  "All themes",
  "Visit canonical, compatibility, GAME, unknown and theme routes; use back/forward",
  "Canonical routes work, aliases resolve, removed routes return custom 404",
  "interaction-matrix.json",
  async () => {
    const checks = [];
    for (const route of ["/", "/blog/", "/projects/", "/about/"]) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      checks.push({ route, status: response?.status(), final: new URL(page.url()).pathname });
    }
    for (const route of ["/works", "/works/", "/me", "/me/"]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForURL(route.startsWith("/works") ? "**/projects/" : "**/about/");
      checks.push({ route, status: 200, final: new URL(page.url()).pathname });
    }
    for (const route of ["/games/", "/definitely-missing"]) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      checks.push({ route, status: response?.status(), final: new URL(page.url()).pathname, title: await page.title() });
    }
    for (const route of ["/themes/blank/", "/themes/blank/projects/", "/themes/kisara/", "/themes/kisara/projects/"]) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      const gameLinks = await page.locator("nav a[href*='game']").count();
      checks.push({ route, status: response?.status(), final: new URL(page.url()).pathname, gameLinks });
    }
    const historyContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const historyPage = await historyContext.newPage();
    await historyPage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await closeNotice(historyPage);
    await historyPage.locator("nav[aria-label='Main navigation'] a[href='/blog/']").dispatchEvent("click");
    await historyPage.waitForURL("**/blog/");
    await historyPage.goBack({ waitUntil: "domcontentloaded" });
    const back = new URL(historyPage.url()).pathname;
    await historyPage.goForward({ waitUntil: "domcontentloaded" });
    const forward = new URL(historyPage.url()).pathname;
    await historyContext.close();
    expect(checks.slice(0, 4).every((item) => item.status === 200), "canonical route failed");
    expect(checks.filter((item) => ["/games/", "/definitely-missing"].includes(item.route)).every((item) => item.status === 404 && item.title.includes("404")), "custom 404 failed");
    expect(checks.filter((item) => item.gameLinks !== undefined).every((item) => item.gameLinks === 0), "GAME link remains");
    expect(back === "/" && forward === "/blog/", `history navigation failed: ${JSON.stringify({ back, forward })}`);
    return { checks, back, forward };
  }
);

await record(
  "External dependency failure",
  "1440x900",
  "Fuyukawa Kagari",
  "Abort every non-local request and load HOME",
  "Core HOME/video/navigation remain usable and Live2D/weather degrade",
  "interaction-matrix.json",
  async () => {
    const offline = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
    await offline.route("**/*", (route) => {
      if (route.request().url().startsWith(baseUrl)) route.continue();
      else route.abort();
    });
    const offlinePage = await offline.newPage();
    const errors = [];
    offlinePage.on("pageerror", (error) => errors.push(error.message));
    await offlinePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await closeNotice(offlinePage);
    await offlinePage.waitForFunction(() => {
      const text = document.querySelector("[data-live2d-status]")?.textContent ?? "";
      return text.includes("失败") || text.includes("备用");
    });
    const result = await offlinePage.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim(),
      nav: document.querySelectorAll("nav[aria-label='Main navigation'] a").length,
      live2d: document.querySelector("[data-live2d-status]")?.textContent,
      weather: document.querySelector("[data-home-weather]")?.textContent,
      video: {
        count: document.querySelectorAll("[data-home-hero-video]").length,
        readyState: document.querySelector("[data-home-hero-video]")?.readyState,
        paused: document.querySelector("[data-home-hero-video]")?.paused
      },
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    }));
    await offline.close();
    expect(
      result.h1 === "Rain_dust" && result.nav === 4 && result.video.count === 1 && result.video.readyState >= 2 && !result.overflow,
      `offline core experience failed: ${JSON.stringify({ result, errors })}`
    );
    return { ...result, errors };
  }
);

await context.close();
await browser.close();

runtime.consoleErrors = runtime.consoleErrors.filter((item) => !item.message.includes("ERR_ABORTED"));
runtime.unexpectedConsoleErrors = runtime.consoleErrors.filter(
  (item) => !/Failed to load resource: the server responded with a status of (404|429)/.test(item.message)
);
runtime.unexpectedNetworkFailures = runtime.networkFailures.filter(
  (item) => !item.error.includes("ERR_ABORTED")
);
await fs.writeFile(path.join(outputDir, "motion-results.json"), `${JSON.stringify(runtime.video, null, 2)}\n`);
await fs.writeFile(path.join(outputDir, "interaction-matrix.json"), `${JSON.stringify(matrix, null, 2)}\n`);
await fs.writeFile(path.join(outputDir, "runtime-summary.json"), `${JSON.stringify(runtime, null, 2)}\n`);

const failed = matrix.filter((item) => item.status === "FAIL");
console.log(JSON.stringify({
  total: matrix.length,
  passed: matrix.length - failed.length,
  failed: failed.length,
  failures: failed.map((item) => ({ feature: item.feature, actual: item.actual })),
  consoleErrors: runtime.consoleErrors,
  localNetworkFailures: runtime.networkFailures,
  unexpectedConsoleErrors: runtime.unexpectedConsoleErrors,
  unexpectedNetworkFailures: runtime.unexpectedNetworkFailures
}, null, 2));
if (failed.length || runtime.unexpectedConsoleErrors.length || runtime.unexpectedNetworkFailures.length) process.exitCode = 1;
