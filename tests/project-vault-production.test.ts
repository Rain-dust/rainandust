import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), "utf8");

test("WORKS enables the cellar on normal desktop visits in a production build", () => {
  const projects = read("src/themes/fuyukawa-kagari/pages/ProjectsPage.astro");

  assert.match(projects, /get\("motion"\) === "force" && fine/);
  assert.doesNotMatch(projects, /import\.meta\.env\.DEV && new URLSearchParams/);
  assert.match(projects, /const immersive = fine/);
  assert.match(projects, /import \{ mountProjectVault3D \} from "\.\.\/scripts\/project-vault-3d"/);
  assert.doesNotMatch(projects, /await import\("\.\.\/scripts\/project-vault-3d"\)/);
  assert.doesNotMatch(projects, /const motion = fine && \(!reduced \|\| forced\)/);
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

  assert.match(projects, /const fallbackMotion = fine && !webglActive/);
  assert.match(projects, /if \(fallbackMotion\) addEventListener\("scroll"/);
  assert.match(engine, /renderer\.shadowMap\.autoUpdate = false/);
  assert.match(engine, /pixelRatioCap/);
  assert.match(engine, /visibilitychange/);
});
