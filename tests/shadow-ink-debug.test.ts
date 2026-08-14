import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), "utf8");

test("Shadow Ink debug UI is imported only by the development layout branch", () => {
  const layout = read("src/themes/fuyukawa-kagari/layouts/BaseLayout.astro");

  assert.match(layout, /const ShadowInkDebug = import\.meta\.env\.DEV/);
  assert.match(layout, /await import\("\.\.\/components\/ShadowInkDebug\.astro"\)/);
  assert.match(layout, /\{ShadowInkDebug && <ShadowInkDebug \/>\}/);
});

test("forced motion preview is explicit, development-only, and preserves original motion", () => {
  const bootstrap = read("src/themes/fuyukawa-kagari/lib/shadow-ink/bootstrap.ts");

  assert.match(bootstrap, /params\.get\("motion"\) === "force"/);
  assert.match(
    bootstrap,
    /return import\.meta\.env\.DEV && requested && this\.finePointer\.matches/
  );
  assert.match(bootstrap, /originalMotion: this\.reducedMotion\.matches \? "REDUCED" : "NORMAL"/);
  assert.match(bootstrap, /return "FORCED MOTION PREVIEW"/);
  assert.match(bootstrap, /return "TRANSITION PREVIEW"/);
});

test("capability fallback computes effective quality without mutating the preset config", () => {
  const bootstrap = read("src/themes/fuyukawa-kagari/lib/shadow-ink/bootstrap.ts");
  const presets = read("src/themes/fuyukawa-kagari/lib/shadow-ink/presets.ts");

  assert.match(bootstrap, /private effectiveQuality\(\): ShadowInkQuality/);
  assert.match(bootstrap, /return \{ \.\.\.this\.config, quality: this\.effectiveQuality\(\) \}/);
  assert.doesNotMatch(bootstrap, /this\.config\.quality\s*=\s*"STATIC"/);
  assert.match(presets, /TRANSITION:[\s\S]*?radius: 0\.06/);
});

test("debug shutdown and diagnostics cover resources, input, and concrete failure details", () => {
  const bootstrap = read("src/themes/fuyukawa-kagari/lib/shadow-ink/bootstrap.ts");
  const engine = read("src/themes/fuyukawa-kagari/lib/shadow-ink/engine.ts");

  assert.match(bootstrap, /sessionStorage\.removeItem\(SESSION_KEY\)/);
  assert.match(bootstrap, /window\[GLOBAL_KEY\]\?\.destroy\(\)/);
  assert.match(bootstrap, /pointerInputCount/);
  assert.match(bootstrap, /splatCount/);
  assert.match(bootstrap, /failureReason/);
  assert.match(engine, /context unavailable/);
  assert.match(engine, /shader compile failure/);
  assert.match(engine, /framebuffer incomplete/);
});

test("page presets carry distinct ink palettes and forced preview does not leak into HOME", () => {
  const types = read("src/themes/fuyukawa-kagari/lib/shadow-ink/types.ts");
  const presets = read("src/themes/fuyukawa-kagari/lib/shadow-ink/presets.ts");
  const engine = read("src/themes/fuyukawa-kagari/lib/shadow-ink/engine.ts");
  const bootstrap = read("src/themes/fuyukawa-kagari/lib/shadow-ink/bootstrap.ts");

  assert.match(types, /inkColor: \[number, number, number\]/);
  assert.match(types, /highlightColor: \[number, number, number\]/);
  assert.match(presets, /HOME:[\s\S]*?opacity: 0\.28[\s\S]*?radius: 0\.052/);
  assert.match(presets, /HOME:[\s\S]*?inkColor: \[0\.37, 0\.43, 0\.49\]/);
  assert.match(engine, /uInkColor: this\.config\.inkColor/);
  assert.match(
    bootstrap,
    /this\.forceMotionActive && routePreset\.name === "PROJECTS"/
  );
  assert.match(
    bootstrap,
    /this\.preset\.name === "TRANSITION" && routePreset\.name !== "PROJECTS"/
  );
});

test("route transitions respect reduced motion after the blog surface retirement", () => {
  const layout = read("src/themes/fuyukawa-kagari/layouts/BaseLayout.astro");
  const css = read("src/themes/fuyukawa-kagari/styles/theme.css");

  assert.match(layout, /data-page-tone=\{pageTone\}/);
  assert.match(css, /::view-transition-old\(root\)/);
  assert.match(css, /::view-transition-new\(root\)/);
  assert.match(css, /html\[data-page-tone="architecture"\]::view-transition/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?::view-transition-old\(root\)/
  );
});
