"use client";

import { useEffect } from "react";

/**
 * The hand-written pages put a page type on `<body>` itself (`admin-page`, `marketplace-page
 * explore-page`). The React layout owns the one shared `<body>`, so pages that need the modifier
 * apply it while they are mounted.
 */
export function BodyClass({ name }: { name: string }) {
  useEffect(() => {
    const names = name.split(/\s+/).filter(Boolean);
    document.body.classList.add(...names);
    return () => document.body.classList.remove(...names);
  }, [name]);
  return null;
}
