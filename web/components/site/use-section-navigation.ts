"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SectionNavigationOptions = {
  /** Section ids in document order, which is the order the marker walks. */
  sectionIds: readonly string[];
  markerRatio?: number;
  markerMax?: number;
  activateLastAtPageEnd?: boolean;
};

/**
 * Port of shared.js `setupSectionNavigation`: the marker line picks the active section, clicking a
 * link pins its section for 900ms, and scrolling releases the pin.
 */
export function useSectionNavigation({
  sectionIds,
  markerRatio = 0.55,
  markerMax = Number.POSITIVE_INFINITY,
  activateLastAtPageEnd = true,
}: SectionNavigationOptions) {
  // The first section is marked active in the served HTML, so it is active before any script runs.
  const [activeId, setActiveId] = useState(() => sectionIds[0] ?? "");
  const pinned = useRef("");
  const pinTimer = useRef(0);
  const frame = useRef(0);

  const update = useCallback(() => {
    frame.current = 0;
    if (pinned.current) return;
    const sections = sectionIds
      .map((id) => (typeof document === "undefined" ? null : document.getElementById(id)))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;
    const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let active = sections[0];
    if (activateLastAtPageEnd && atPageEnd) {
      active = sections[sections.length - 1];
    } else {
      const marker = window.scrollY + Math.min(markerMax, window.innerHeight * markerRatio);
      for (const section of sections) {
        if (section.getBoundingClientRect().top + window.scrollY <= marker) active = section;
        else break;
      }
    }
    setActiveId(active.id);
  }, [activateLastAtPageEnd, markerMax, markerRatio, sectionIds]);

  const schedule = useCallback(() => {
    if (!frame.current) frame.current = window.requestAnimationFrame(update);
  }, [update]);

  const pin = useCallback((id: string) => {
    pinned.current = id;
    window.clearTimeout(pinTimer.current);
    pinTimer.current = window.setTimeout(() => {
      pinned.current = "";
    }, 900);
    setActiveId(id);
  }, []);

  const release = useCallback(() => {
    if (!pinned.current) return;
    window.clearTimeout(pinTimer.current);
    pinned.current = "";
    schedule();
  }, [schedule]);

  useEffect(() => {
    const releaseOnNavigationKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) release();
    };
    const onHashChange = () => {
      const id = window.location.hash.slice(1);
      if (sectionIds.includes(id)) pin(id);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("keydown", releaseOnNavigationKey);
    window.addEventListener("hashchange", onHashChange);
    const initialId = window.location.hash.slice(1);
    if (sectionIds.includes(initialId)) pin(initialId);
    else update();
    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current);
      window.clearTimeout(pinTimer.current);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", releaseOnNavigationKey);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [pin, release, schedule, sectionIds, update]);

  return { activeId, pin };
}
