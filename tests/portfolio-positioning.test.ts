import assert from "node:assert/strict";
import test from "node:test";
import { portfolioPositioning, portfolioRoleLine } from "../src/core/data/portfolio.ts";
import { profileIdentity, profileStatus } from "../src/core/data/profile.ts";
import { site } from "../src/lib/site.ts";

test("portfolio positioning uses Creative Engineer as the public identity", () => {
  assert.equal(portfolioPositioning.brand, "Rain_dust");
  assert.equal(portfolioPositioning.primaryRole, "Creative Engineer");
  assert.equal(portfolioPositioning.secondaryRole, "Independent Builder");
  assert.equal(portfolioRoleLine, "Creative Engineer / Independent Builder");
  assert.equal(portfolioPositioning.introduction, "把模糊想法快速构建成可运行原型的独立开发者。");
  assert.equal(profileIdentity.siteName, portfolioRoleLine);
  assert.equal(site.title, "Rain_dust | Creative Engineer");
  assert.match(site.description, /Creative Engineer \/ Independent Builder/);
  assert.doesNotMatch(site.title, /Vibe Coder/);
});

test("Vibe Coder remains a personality tag instead of the professional title", () => {
  assert.deepEqual(portfolioPositioning.personaTags, ["Vibe Coder"]);
  assert.equal(profileStatus.includes("Vibe Coder（人格标签）"), true);
  assert.notEqual(profileIdentity.siteName, "Vibe Coder");
});

test("portfolio positioning exposes the four approved capability directions", () => {
  assert.deepEqual(
    portfolioPositioning.capabilities.map(({ key }) => key),
    ["ai-prototype", "interactive-web", "automation", "creative-coding"]
  );
  assert.equal(portfolioPositioning.currentMission, "贵州贵客松 2026");
});
