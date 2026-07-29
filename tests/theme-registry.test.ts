import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_THEME_ID,
  getCanonicalPath,
  getThemePath,
  isThemeId
} from "../src/core/themes/registry.ts";

test("theme registry exposes Fuyukawa Kagari as the only public theme", () => {
  assert.equal(DEFAULT_THEME_ID, "fuyukawa-kagari");
  assert.equal(isThemeId("fuyukawa-kagari"), true);
  assert.equal(isThemeId("blank"), false);
  assert.equal(isThemeId("kisara"), false);
  assert.equal(isThemeId("removed-theme"), false);
});

test("removed theme paths are not mapped onto canonical pages", () => {
  assert.equal(getCanonicalPath("/themes/blank/"), "/themes/blank/");
  assert.equal(getCanonicalPath("/themes/blank/blog/example-note/"), "/themes/blank/blog/example-note/");
  assert.equal(getCanonicalPath("/themes/kisara/"), "/themes/kisara/");
  assert.equal(getCanonicalPath("/themes/kisara/blog/example-note/"), "/themes/kisara/blog/example-note/");
  assert.equal(getCanonicalPath("/blog/example-note/"), "/blog/example-note/");
});

test("default theme paths preserve canonical page context", () => {
  const article = "/blog/example-note/";
  assert.equal(getThemePath("fuyukawa-kagari", article), article);
  assert.equal(getThemePath("fuyukawa-kagari", "/about/"), "/about/");
});
