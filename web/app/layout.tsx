import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Template Marketplace",
  description: "A template-driven Markdown-to-LaTeX publishing ecosystem.",
  icons: {
    icon: [
      {
        url: "/favicon.svg?v=20260728-9",
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

/**
 * Runs before the body renders so a stored theme is applied without a flash, exactly like the
 * inline bootstrap in the hand-written pages. Only a validated theme id is trusted.
 */
const themeBootstrap = `(function(){var t=null;try{t=localStorage.getItem("litho-theme")}catch(e){}document.documentElement.dataset.theme=/^[a-z0-9-]{1,32}$/.test(t||"")?t:"dark";})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        {children}
      </body>
    </html>
  );
}
