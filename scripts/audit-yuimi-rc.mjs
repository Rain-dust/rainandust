import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const targetRoot = process.cwd();
const upstreamRoot = path.resolve(process.env.YUIMI_UPSTREAM_PATH ?? "../yuimi-chaya-reference");
const outputDir = path.resolve("artifacts/yuimi-release-candidate/audit");
const ignoredDirectories = new Set([".git", "node_modules", "dist", ".astro", "artifacts"]);

const allowedChanged = new Set([
  ".gitignore", "astro.config.mjs", "package.json", "package-lock.json", "README.md",
  "src/core/ConsoleEasterEgg.astro", "src/core/data/profile.ts", "src/core/data/projects.ts", "src/lib/site.ts",
  "src/themes/blank/index.ts", "src/themes/blank/layouts/BlankLayout.astro",
  "src/themes/blank/pages/AboutPage.astro", "src/themes/blank/pages/ArticlePage.astro",
  "src/themes/blank/pages/BlogIndexPage.astro", "src/themes/blank/pages/HomePage.astro",
  "src/themes/blank/pages/NotFoundPage.astro", "src/themes/blank/pages/ProjectsPage.astro",
  "src/themes/fuyukawa-kagari/assets.ts", "src/themes/fuyukawa-kagari/data/noticeContent.ts",
  "src/themes/fuyukawa-kagari/index.ts", "src/themes/fuyukawa-kagari/layouts/ArticleLayout.astro",
  "src/themes/fuyukawa-kagari/layouts/BaseLayout.astro", "src/themes/fuyukawa-kagari/pages/AboutPage.astro",
  "src/themes/fuyukawa-kagari/pages/BlogIndexPage.astro", "src/themes/fuyukawa-kagari/pages/HomePage.astro",
  "src/themes/fuyukawa-kagari/pages/NotFoundPage.astro", "src/themes/fuyukawa-kagari/pages/ProjectsPage.astro",
  "src/themes/kisara/index.ts", "src/themes/kisara/layouts/KisaraLayout.astro",
  "src/themes/kisara/lib/routeWarmup.ts", "src/themes/kisara/pages/AboutPage.astro",
  "src/themes/kisara/pages/ArticlePage.astro", "src/themes/kisara/pages/BlogIndexPage.astro",
  "src/themes/kisara/pages/HomePage.astro", "src/themes/kisara/pages/ProjectsPage.astro",
  "src/themes/kisara/styles/about.css", "public/themes/fuyukawa-kagari/music/manifest.json"
]);

const allowedDeleted = new Set([
  "public/themes/kisara/games/2048/index.html", "src/core/data/games.ts", "src/pages/games.astro",
  "src/pages/themes/blank/games.astro", "src/pages/themes/kisara/games.astro",
  "src/themes/blank/pages/GamesPage.astro", "src/themes/fuyukawa-kagari/pages/GamesPage.astro",
  "src/themes/kisara/pages/GamesPage.astro", "src/themes/kisara/styles/games.css"
]);

const walk = async (root, relative = "") => {
  const result = [];
  for (const entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const child = path.posix.join(relative.replaceAll("\\", "/"), entry.name);
    if (entry.isDirectory()) result.push(...await walk(root, child));
    else if (entry.isFile()) result.push(child);
  }
  return result;
};
const sha256 = async (file) => createHash("sha256").update(await fs.readFile(file)).digest("hex");

const upstreamFiles = await walk(upstreamRoot);
const targetFiles = new Set(await walk(targetRoot));
const modified = [];
const deleted = [];
let identical = 0;
for (const relative of upstreamFiles) {
  if (!targetFiles.has(relative)) {
    deleted.push(relative);
    continue;
  }
  const [upstreamHash, targetHash] = await Promise.all([
    sha256(path.join(upstreamRoot, relative)),
    sha256(path.join(targetRoot, relative))
  ]);
  if (upstreamHash === targetHash) identical += 1;
  else modified.push(relative);
}

const unexpectedChanged = modified.filter((file) => !allowedChanged.has(file));
const unexpectedDeleted = deleted.filter((file) => !allowedDeleted.has(file));
const missingExpectedChanges = [...allowedChanged].filter((file) => !modified.includes(file));
const missingExpectedDeletions = [...allowedDeleted].filter((file) => !deleted.includes(file));

const themeStyles = [
  "src/themes/fuyukawa-kagari/styles/theme.css",
  "src/themes/blank/styles/theme.css",
  "src/themes/kisara/styles/theme.css"
];
const themeHashes = {};
for (const file of themeStyles) {
  themeHashes[file] = {
    target: await sha256(path.join(targetRoot, file)),
    upstream: await sha256(path.join(upstreamRoot, file))
  };
}

const textExtensions = new Set([".astro", ".css", ".html", ".js", ".json", ".md", ".mjs", ".ts", ".txt", ".xml"]);
const targetTextFiles = (await walk(targetRoot)).filter((file) => textExtensions.has(path.extname(file)));
const upstreamWhitespace = new Set();
const allowedTargetWhitespace = new Set([
  "docs/HANDOFF_YUIMI_EXACT_PORT.md:3",
  "docs/HANDOFF_YUIMI_EXACT_PORT.md:4",
  "docs/HANDOFF_YUIMI_EXACT_PORT.md:122",
  "docs/HANDOFF_YUIMI_EXACT_PORT.md:123",
  "docs/YUIMI_AUTONOMOUS_CONTINUATION.md:3",
  "docs/YUIMI_AUTONOMOUS_CONTINUATION.md:4"
]);
for (const relative of upstreamFiles.filter((file) => textExtensions.has(path.extname(file)))) {
  const lines = (await fs.readFile(path.join(upstreamRoot, relative), "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) upstreamWhitespace.add(`${relative}:${index + 1}:${line}`);
  });
}
const targetWhitespace = [];
for (const relative of targetTextFiles) {
  const lines = (await fs.readFile(path.join(targetRoot, relative), "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) targetWhitespace.push(`${relative}:${index + 1}:${line}`);
  });
}
const introducedWhitespace = targetWhitespace.filter((item) => {
  const location = item.split(":").slice(0, 2).join(":");
  return !upstreamWhitespace.has(item) && !allowedTargetWhitespace.has(location);
});

const scanRoots = ["src", "public", "dist", "worker", "docs", "README.md", "THIRD_PARTY.md"];
const secretPattern = /(AIza[0-9A-Za-z_-]{30,}|sk-[0-9A-Za-z_-]{20,}|gh[pousr]_[0-9A-Za-z]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/g;
const identityPattern = /(Yuimi(?:-chaya| Lab)?|喝益胃|Rain_dust|寻辰沐雨)/gi;
const urlPattern = /https?:\/\/[^"'`\s)<>\]]+/g;
const secretHits = [];
const identityHits = [];
const domains = new Set();
for (const root of scanRoots) {
  const absolute = path.join(targetRoot, root);
  let files = [];
  try {
    const stat = await fs.stat(absolute);
    files = stat.isDirectory() ? (await walk(targetRoot, root)).filter((file) => textExtensions.has(path.extname(file))) : [root];
  } catch {
    continue;
  }
  for (const relative of files) {
    const text = await fs.readFile(path.join(targetRoot, relative), "utf8");
    for (const match of text.matchAll(secretPattern)) secretHits.push({ file: relative, tokenPrefix: `${match[0].slice(0, 8)}…` });
    const identities = [...new Set([...text.matchAll(identityPattern)].map((match) => match[0]))];
    if (identities.length) identityHits.push({ file: relative, identities });
    for (const match of text.matchAll(urlPattern)) {
      try { domains.add(new URL(match[0].replace(/[.,;:]$/, "")).hostname); } catch {}
    }
  }
}

const report = {
  upstreamRoot,
  upstreamFiles: upstreamFiles.length,
  identical,
  modified,
  deleted,
  unexpectedChanged,
  unexpectedDeleted,
  missingExpectedChanges,
  missingExpectedDeletions,
  themeHashes,
  whitespace: {
    upstreamBaselineCount: upstreamWhitespace.size,
    targetCount: targetWhitespace.length,
    introduced: introducedWhitespace
  },
  secrets: secretHits,
  identities: identityHits,
  externalDomains: [...domains].sort(),
  passed: unexpectedChanged.length === 0
    && unexpectedDeleted.length === 0
    && missingExpectedChanges.length === 0
    && missingExpectedDeletions.length === 0
    && Object.values(themeHashes).every(({ target, upstream }) => target === upstream)
    && introducedWhitespace.length === 0
    && secretHits.length === 0
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, "audit-results.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  passed: report.passed,
  identical,
  modified: modified.length,
  deleted: deleted.length,
  unexpectedChanged,
  unexpectedDeleted,
  missingExpectedChanges,
  missingExpectedDeletions,
  introducedWhitespace: introducedWhitespace.length,
  secretHits: secretHits.length,
  domains: report.externalDomains
}, null, 2));
if (!report.passed) process.exitCode = 1;
