#!/usr/bin/env node
// Test entry point.
//
// The GitHub workflow tests execute real workflow shell steps locally, and some
// of those steps need `jq`. Linux and macOS CI images ship jq; Windows does not.
// When jq is missing, this runner downloads the official Windows build into
// `tools/`, prepends the project-local shim directory to PATH, and then runs
// `node --test` unchanged.
import { spawn } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, renameSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const toolsDir = path.join(root, "tools");
const shim = path.join(toolsDir, process.platform === "win32" ? "jq" : "jq.exe.bin");
const binary = path.join(toolsDir, "jq.exe.bin");
const jqUrl = "https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-windows-amd64.exe";

async function downloadJq() {
  mkdirSync(toolsDir, { recursive: true });
  const partial = `${binary}.download`;
  const response = await fetch(jqUrl);
  if (!response.ok) throw new Error(`jq download failed: ${response.status}`);
  await pipeline(response.body, createWriteStream(partial));
  renameSync(partial, binary);
}

async function main() {
  if (process.platform === "win32") {
    if (existsSync(binary)) {
      console.error("tools/: using the project-local jq build for the workflow tests");
    } else {
      console.error("tools/: downloading jq for the workflow tests…");
      try {
        await downloadJq();
      } catch (error) {
        console.error(`tools/: jq download failed (${error.message}); workflow tests that need jq will fail`);
      }
    }
    if (existsSync(shim) && existsSync(binary)) {
      process.env.PATH = `${process.env.PATH || ""}${path.delimiter}${toolsDir}`;
    }
  }

  const child = spawn(process.execPath, ["--test", ...process.argv.slice(2)], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    process.exit(code ?? (signal ? 1 : 0));
  });
}

await main();
