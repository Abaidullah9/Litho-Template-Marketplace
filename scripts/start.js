#!/usr/bin/env node
/**
 * scripts/start.js
 *
 * Deterministic local launcher. Explicitly pins PORT/HOST so the server
 * starts even when the host shell injects junk (e.g. PORT="0"). All other
 * configuration (Supabase URL/keys, admin credentials, DB URL) is read from
 * the project .env by server/config.js — no credentials are duplicated here.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const env = Object.assign({}, process.env, {
  PORT: Number(process.env.PORT) > 0 ? String(process.env.PORT) : "8787",
  HOST: process.env.HOST || "0.0.0.0",
});

const child = spawn("node", [path.join(projectRoot, "server", "index.js")], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
});

child.on("error", (err) => {
  console.error("failed to start server:", err.message);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
