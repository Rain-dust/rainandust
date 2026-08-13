import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), "utf8");

test("WORKS can explicitly enable the cellar motion in a production build", () => {
  const projects = read("src/themes/fuyukawa-kagari/pages/ProjectsPage.astro");

  assert.match(projects, /get\("motion"\) === "force" && fine/);
  assert.doesNotMatch(projects, /import\.meta\.env\.DEV && new URLSearchParams/);
  assert.match(projects, /data-vault-booting="true"/);
});

test("HOME uses the same explicit motion preview contract in development and production", () => {
  const home = read("src/themes/fuyukawa-kagari/pages/HomePage.astro");

  assert.match(home, /Astro\.url\.searchParams\.get\("motion"\) === "force"/);
  assert.doesNotMatch(home, /import\.meta\.env\.DEV && Astro\.url\.searchParams/);
});

test("WORKS does not run its hidden fallback animation beside WebGL", () => {
  const projects = read("src/themes/fuyukawa-kagari/pages/ProjectsPage.astro");
  const engine = read("src/themes/fuyukawa-kagari/scripts/project-vault-3d.ts");

  assert.match(projects, /const fallbackMotion = motion && !webglActive/);
  assert.match(projects, /if \(fallbackMotion\) addEventListener\("scroll"/);
  assert.match(engine, /renderer\.shadowMap\.autoUpdate = false/);
  assert.match(engine, /pixelRatioCap/);
  assert.match(engine, /visibilitychange/);
});
