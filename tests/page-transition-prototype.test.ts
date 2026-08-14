import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

test("T1 prototype is mounted only through a DEV-only layout import", () => {
  const layout = read("src/themes/fuyukawa-kagari/layouts/BaseLayout.astro");

  assert.match(layout, /const PageTransitionPrototype = import\.meta\.env\.DEV/);
  assert.match(layout, /import\("\.\.\/components\/PageTransitionPrototype\.astro"\)/);
  assert.match(layout, /\{PageTransitionPrototype && <PageTransitionPrototype \/>\}/);
});

test("T1 keeps one persistent two-layer stage and leaves pointer input to the page", () => {
  const component = read(
    "src/themes/fuyukawa-kagari/components/PageTransitionPrototype.astro",
  );
  const adapter = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/adapter.ts",
  );
  const styles = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/prototype.css",
  );

  assert.match(component, /transition:persist/);
  assert.match(component, /data-page-transition-prototype-host/);
  assert.match(component, /import "\.\.\/lib\/page-transition\/prototype\.css"/);
  assert.doesNotMatch(
    read("src/themes/fuyukawa-kagari/lib/page-transition/controller.ts"),
    /import "\.\/prototype\.css"/,
  );
  assert.match(styles, /pointer-events:\s*none/);
  assert.match(adapter, /page-transition-safety-shape/);
  assert.match(adapter, /page-transition-ink/);
  assert.match(adapter, /new NativeShadowInkEngine/);
  assert.match(adapter, /clonePreset\("TRANSITION"\)/);
});

test("directional ink covers every ordered pair across the three public pages", () => {
  const routes = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/routes.ts",
  );

  assert.match(routes, /"\/": \{ id: "home", tone: "paper" \}/);
  assert.match(routes, /"\/projects\/": \{ id: "projects", tone: "architecture" \}/);
  assert.match(routes, /"\/about\/": \{ id: "about", tone: "profile" \}/);
  assert.doesNotMatch(routes, /"\/blog\/"/);
  assert.match(routes, /direction: `\$\{fromPage\.id\}-to-\$\{toPage\.id\}`/);
});

test("T1 coordinates preparation and reveal without replacing Astro's swap", () => {
  const controller = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/controller.ts",
  );

  assert.match(controller, /astro:before-preparation/);
  assert.match(controller, /astro:after-preparation/);
  assert.match(controller, /astro:before-swap/);
  assert.match(controller, /astro:after-swap/);
  assert.match(controller, /astro:page-load/);
  assert.match(controller, /Promise\.all\(\[originalLoader\(\), coverPromise\]\)/);
  assert.doesNotMatch(controller, /\.swap\s*=/);
});

test("shared navigation and progress rail resync their page material after Astro swaps", () => {
  const layout = read("src/themes/fuyukawa-kagari/layouts/BaseLayout.astro");
  const styles = read("src/themes/fuyukawa-kagari/styles/theme.css");

  assert.match(layout, /const resolvePageTone = \(pathname: string\)/);
  assert.match(layout, /document\.documentElement\.dataset\.pageTone = tone/);
  assert.match(layout, /document\.addEventListener\("astro:after-swap", syncPageShell/);
  assert.match(layout, /document\.addEventListener\("astro:page-load", syncPageShell/);
  assert.match(layout, /ensurePageShellCriticalStyle\(\)/);
  assert.match(layout, /rain-dust-page-shell-critical/);
  assert.match(layout, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\) !important/);
  assert.match(layout, /link\.setAttribute\("aria-current", "page"\)/);
  assert.match(styles, /html\[data-page-tone="architecture"\] \.nav-links/);
  assert.match(styles, /html\[data-page-tone="profile"\] \.pig-scrollbar-track/);
  assert.match(styles, /html\[data-page-tone="profile"\] \.nav-links/);
});

test("T1 always returns to Idle after reveal and bounds the Astro snapshot wait", () => {
  const controller = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/controller.ts",
  );
  const adapter = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/adapter.ts",
  );

  assert.match(controller, /Promise\.race\(\[snapshotFinished, snapshotTimeout\]\)/);
  assert.match(controller, /this\.state = "Completed";\s*this\.finishTransaction\(transactionId\)/);
  assert.doesNotMatch(controller, /if \(this\.pageLoaded\) this\.finishTransaction/);
  assert.match(adapter, /waitForAnimations\(this\.sheetAnimations, duration/);
  assert.match(adapter, /Promise\.race\(\[finished, timeout\]\)/);
});

test("directional ink prewarms WebGL and retains the paper-mask fallback", () => {
  const controller = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/controller.ts",
  );
  const adapter = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/adapter.ts",
  );
  const styles = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/prototype.css",
  );

  assert.match(controller, /canUseWebGl\(\)/);
  assert.match(controller, /new PageTransitionAdapter\(this\.host, this\.canUseWebGl\(\)\)/);
  assert.match(styles, /will-change:\s*transform, opacity/);
  assert.match(adapter, /data-page-transition-sheet/);
  assert.match(styles, /mask-image:/);
});

test("directional ink provides explicit mobile and reduced-motion paths", () => {
  const controller = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/controller.ts",
  );
  const adapter = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/adapter.ts",
  );

  assert.match(controller, /modeForCurrentCapabilities/);
  assert.match(adapter, /"fluid" \| "mask" \| "reduced"/);
  assert.match(adapter, /REDUCED_COVER_DURATION/);
  assert.match(adapter, /REDUCED_REVEAL_DURATION/);
});

test("T1 prototype session is isolated and wins over Shadow Ink debug", () => {
  const controller = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/controller.ts",
  );
  const shadowBootstrap = read(
    "src/themes/fuyukawa-kagari/lib/shadow-ink/bootstrap.ts",
  );

  assert.match(controller, /page-transition-prototype-v1/);
  assert.match(controller, /request === "off"/);
  assert.match(controller, /rain-dust-shadow-ink-debug-v1/);
  assert.match(controller, /__rainDustShadowInkDebug/);
  assert.match(shadowBootstrap, /page-transition-prototype-v1/);
  assert.match(shadowBootstrap, /return \{ mode: "off", forceMotion: false \}/);
});

test("T1 exposes diagnostics and preserves original reduced-motion state", () => {
  const controller = read(
    "src/themes/fuyukawa-kagari/lib/page-transition/controller.ts",
  );

  assert.match(controller, /__rainDustPageTransitionPrototype/);
  assert.match(controller, /getDebugState/);
  assert.match(controller, /originalMotion/);
  assert.match(controller, /override/);
  assert.match(controller, /canvasCount/);
  assert.match(controller, /engineCount/);
  assert.match(controller, /transitionTransactionId/);
  assert.match(controller, /transitionState = "Idle"/);
});

test("production output does not contain the DEV prototype when dist exists", () => {
  const dist = path.join(root, "dist");
  if (!fs.existsSync(dist)) return;

  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(?:html|js|css|mjs)$/.test(entry.name)) files.push(full);
    }
  };
  walk(dist);
  const output = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(output, /__rainDustPageTransitionPrototype/);
  assert.doesNotMatch(output, /data-page-transition-prototype-host/);
  assert.doesNotMatch(output, /page-transition=prototype/);
});
