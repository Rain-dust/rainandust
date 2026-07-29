import { copyFile, mkdir, rm } from "node:fs/promises";

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });

await Promise.all([
  rm("dist/client/blog-covers", { force: true, recursive: true }),
  rm("dist/client/themes/kisara", { force: true, recursive: true })
]);

await Promise.all([
  copyFile("worker/index.js", "dist/server/index.js"),
  copyFile(".openai/hosting.json", "dist/.openai/hosting.json"),
]);
