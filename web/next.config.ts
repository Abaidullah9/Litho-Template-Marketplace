import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import type { NextConfig } from "next";

/**
 * The static export lands in `site/`, which the Express server serves at its root and GitHub
 * Pages publishes verbatim. Routes therefore keep the legacy URL shape (`/explore.html`, not
 * `/explore/`), which is why trailing slashes stay off: the export writes `out/explore.html`.
 *
 * While developing, the shared assets still live in `site/`, so the dev server proxies them to the
 * legacy server instead of duplicating megabytes of images and fonts into `public/`.
 */
const legacyOrigin = process.env.LEGACY_SITE_ORIGIN || "http://127.0.0.1:8787";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Litho-Template-Marketplace";

export default function nextConfig(phase: string): NextConfig {
  const config: NextConfig = {
    output: "export",
    basePath: basePath || undefined,
    reactStrictMode: true,
    images: { unoptimized: true },
    trailingSlash: false,
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    config.rewrites = async () => [
      { source: "/assets/:path*", destination: `${legacyOrigin}/assets/:path*` },
      { source: "/uploads/:path*", destination: `${legacyOrigin}/uploads/:path*` },
      { source: "/api/:path*", destination: `${legacyOrigin}/api/:path*` },
      { source: "/catalog.json", destination: `${legacyOrigin}/catalog.json` },
      { source: "/registry.json", destination: `${legacyOrigin}/registry.json` },
      { source: "/explorer-data.json", destination: `${legacyOrigin}/explorer-data.json` },
    ];
  }

  return config;
}
