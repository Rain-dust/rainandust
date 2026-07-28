import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist/client");
const walk = async (directory) => {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file));
    else files.push(file);
  }
  return files;
};
const resolvePublic = (reference) => {
  const pathname = reference.split(/[?#]/, 1)[0];
  if (!pathname.startsWith("/")) return null;
  const decoded = decodeURIComponent(pathname);
  const direct = path.join(root, decoded);
  return decoded.endsWith("/") ? path.join(direct, "index.html") : direct;
};

const files = await walk(root);
const missing = [];
let htmlReferences = 0;
let cssReferences = 0;
for (const file of files) {
  const extension = path.extname(file);
  if (extension !== ".html" && extension !== ".css") continue;
  const text = await fs.readFile(file, "utf8");
  const expressions = extension === ".html"
    ? [/(?:href|src|poster)=["']([^"'#]+)["']/g]
    : [/url\(["']?([^"')]+)["']?\)/g];
  for (const expression of expressions) {
    for (const match of text.matchAll(expression)) {
      const reference = match[1];
      if (/^(?:https?:|mailto:|tel:|data:|blob:|javascript:|#)/i.test(reference)) continue;
      const absolute = resolvePublic(reference);
      if (!absolute) continue;
      if (extension === ".html") htmlReferences += 1;
      else cssReferences += 1;
      let exists = false;
      try {
        const stat = await fs.stat(absolute);
        exists = stat.isFile();
        if (!exists && stat.isDirectory()) {
          exists = (await fs.stat(path.join(absolute, "index.html"))).isFile();
        }
      } catch {}
      if (!exists) missing.push({ file: path.relative(root, file), reference });
    }
  }
}
console.log(JSON.stringify({
  htmlFiles: files.filter((file) => file.endsWith(".html")).length,
  cssFiles: files.filter((file) => file.endsWith(".css")).length,
  htmlReferences,
  cssReferences,
  missing
}, null, 2));
if (missing.length) process.exitCode = 1;
