#!/usr/bin/env node
import { loadConfig } from "./config.js";
import { createSupabase } from "./supabase.js";
import { createApp } from "./app.js";

const config = loadConfig();

let cachedClient = null;
const supabase = () => {
  if (!config.supabaseConfigured) return null;
  if (!cachedClient) cachedClient = createSupabase(config);
  return cachedClient;
};

const app = createApp({ config, supabase });

const server = app.listen(config.port, config.host, () => {
  const banner = [
    `Template Marketplace listening on http://${config.host}:${config.port}`,
    `  Supabase: ${config.supabaseConfigured ? "configured" : "NOT configured — set SUPABASE_URL / keys in .env"}`,
    `  Admin:    ${config.adminConfigured ? "configured" : "NOT configured — set ADMIN_PASSWORD / ADMIN_SESSION_SECRET in .env"}`,
    `  Admin UI: http://${config.host}:${config.port}/admin`,
  ];
  console.log(banner.join("\n"));
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2_000).unref();
  });
}
