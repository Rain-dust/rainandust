import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const targetRoot = process.cwd();
const upstreamRoot = path.resolve(process.env.YUIMI_UPSTREAM_PATH ?? "../yuimi-chaya-reference");
const nodeExecutable = process.execPath;
const outputDir = path.resolve("artifacts/yuimi-release-candidate/diagnostics");

const stripAnsi = (value) => value.replace(/\u001b\[[0-9;]*m/g, "");
const runCheck = async (root) => {
  const astroCli = path.join(root, "node_modules/astro/bin/astro.mjs");
  try {
    const result = await execFileAsync(nodeExecutable, [astroCli, "check", "--minimumSeverity", "error"], {
      cwd: root,
      env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=12288", NO_COLOR: "1", FORCE_COLOR: "0" },
      maxBuffer: 128 * 1024 * 1024,
      timeout: 300_000
    });
    return { exitCode: 0, output: stripAnsi(`${result.stdout}\n${result.stderr}`) };
  } catch (error) {
    return {
      exitCode: error.code ?? 1,
      output: stripAnsi(`${error.stdout ?? ""}\n${error.stderr ?? ""}`),
      signal: error.signal ?? null,
      killed: Boolean(error.killed)
    };
  }
};

const parse = (output) => {
  const diagnostics = [];
  const pattern = /^(.+?):(\d+):(\d+) - error ts\((\d+)\): (.+)$/gm;
  for (const match of output.matchAll(pattern)) {
    diagnostics.push({
      file: match[1].replaceAll("\\", "/"),
      line: Number(match[2]),
      column: Number(match[3]),
      code: `ts(${match[4]})`,
      message: match[5]
    });
  }
  const summary = output.match(/Result \((\d+) files\):\s*-\s*(\d+) errors(?:\s*-\s*(\d+) warnings)?(?:\s*-\s*(\d+) hints)?/s);
  return {
    diagnostics,
    summary: summary ? {
      files: Number(summary[1]),
      errors: Number(summary[2]),
      warnings: Number(summary[3] ?? 0),
      hints: Number(summary[4] ?? 0)
    } : null
  };
};

await fs.mkdir(outputDir, { recursive: true });
console.log("Running target full diagnostics...");
const target = process.env.YUIMI_DIAGNOSTICS_SKIP_TARGET === "1"
  ? { exitCode: 1, output: await fs.readFile(path.join(outputDir, "target-full-check.log"), "utf8") }
  : await runCheck(targetRoot);
if (process.env.YUIMI_DIAGNOSTICS_SKIP_TARGET !== "1") {
  await fs.writeFile(path.join(outputDir, "target-full-check.log"), target.output);
}
console.log("Running locked-upstream full diagnostics...");
const upstream = process.env.YUIMI_DIAGNOSTICS_SKIP_UPSTREAM === "1"
  ? { exitCode: 1, output: await fs.readFile(path.join(outputDir, "upstream-full-check.log"), "utf8") }
  : await runCheck(upstreamRoot);
if (process.env.YUIMI_DIAGNOSTICS_SKIP_UPSTREAM !== "1") {
  await fs.writeFile(path.join(outputDir, "upstream-full-check.log"), upstream.output);
}

const targetParsed = parse(target.output);
const upstreamParsed = parse(upstream.output);
const key = (item) => `${item.file}:${item.code}:${item.message}`;
const upstreamKeys = new Set(upstreamParsed.diagnostics.map(key));
const targetKeys = new Set(targetParsed.diagnostics.map(key));
const targetOnly = targetParsed.diagnostics.filter((item) => !upstreamKeys.has(key(item)));
const upstreamOnly = upstreamParsed.diagnostics.filter((item) => !targetKeys.has(key(item)));
const result = {
  target: { exitCode: target.exitCode, signal: target.signal ?? null, killed: target.killed ?? false, ...targetParsed },
  upstream: { exitCode: upstream.exitCode, signal: upstream.signal ?? null, killed: upstream.killed ?? false, ...upstreamParsed },
  targetOnly,
  upstreamOnly
};
await fs.writeFile(path.join(outputDir, "diagnostic-comparison.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  target: { exitCode: result.target.exitCode, summary: result.target.summary, parsed: result.target.diagnostics.length },
  upstream: { exitCode: result.upstream.exitCode, summary: result.upstream.summary, parsed: result.upstream.diagnostics.length },
  targetOnly: targetOnly.length,
  upstreamOnly: upstreamOnly.length
}, null, 2));
if (!targetParsed.summary || !upstreamParsed.summary || targetOnly.length > 0) process.exitCode = 1;
