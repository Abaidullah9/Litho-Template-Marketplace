"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { applyTheme, pickerLayout, readStoredTheme, siteThemes, themeById, themePreviewPath } from "@/lib/themes";

type Positions = ReturnType<typeof pickerLayout> | null;

/**
 * React port of shared.js `setupThemeToggle`: same markup, same keyboard and wheel contract, same
 * picker geometry. The picker is created on first open (the hand-written pages inject it with JS
 * too, so the served HTML stays identical).
 */
export function ThemeToggle() {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const wheelAccRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [previewsLoaded, setPreviewsLoaded] = useState(false);
  const [compact, setCompact] = useState(false);
  const [committed, setCommitted] = useState("dark");
  const [selected, setSelected] = useState(0);
  const [currentId, setCurrentId] = useState("dark");
  const [statusText, setStatusText] = useState("");
  const [positions, setPositions] = useState<Positions>(null);
  const [top, setTop] = useState(44);

  const current = themeById(currentId);

  const layout = useCallback(() => {
    const picker = pickerRef.current;
    const strip = stripRef.current;
    if (!picker) return;
    const anchor = picker.closest(".market-header, .doc-topbar, .admin-topbar") || document.body;
    setTop(Math.round(anchor.getBoundingClientRect().bottom));
    const isCompact = window.matchMedia("(max-width: 760px)").matches;
    setCompact(isCompact);
    if (isCompact) {
      setPositions(null);
      return;
    }
    setPositions(pickerLayout(siteThemes.length, selected, strip?.clientWidth || window.innerWidth));
  }, [selected]);

  const reflect = useCallback((id: string) => {
    setCurrentId(id);
    const theme = themeById(id);
    toggleRef.current?.setAttribute("aria-label", `Choose color theme; current ${theme.name}`);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setReady(false);
  }, []);

  const restoreFocus = useCallback(() => {
    const target = restoreFocusRef.current?.isConnected ? restoreFocusRef.current : toggleRef.current;
    target?.focus({ preventScroll: true });
    restoreFocusRef.current = null;
  }, []);

  const preview = useCallback(
    (index: number) => {
      const theme = siteThemes[index];
      applyTheme(theme.id, { persist: false });
      setStatusText(`Previewing ${theme.name}`);
    },
    [],
  );

  const openPicker = useCallback(() => {
    const active = document.activeElement;
    restoreFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : toggleRef.current;
    const stored = themeById(document.documentElement.dataset.theme);
    const index = Math.max(0, siteThemes.findIndex((theme) => theme.id === stored.id));
    setPreviewsLoaded(true);
    setCommitted(stored.id);
    setSelected(index);
    preview(index);
    setOpen(true);
  }, [preview]);

  const apply = useCallback(
    ({ restore = false } = {}) => {
      const next = applyTheme(siteThemes[selected].id).id;
      setCommitted(next);
      reflect(next);
      close();
      if (restore) restoreFocus();
    },
    [close, reflect, restoreFocus, selected],
  );

  const cancel = useCallback(
    ({ restore = false } = {}) => {
      applyTheme(committed);
      reflect(committed);
      close();
      if (restore) restoreFocus();
    },
    [close, committed, reflect, restoreFocus],
  );

  const move = useCallback(
    (direction: number) => {
      setSelected((index) => {
        const next = (index + direction + siteThemes.length) % siteThemes.length;
        preview(next);
        return next;
      });
    },
    [preview],
  );

  // Mount mirrors the legacy bootstrap: apply the stored theme, then reflect it on the control.
  useEffect(() => {
    const stored = applyTheme(readStoredTheme(), { persist: false });
    reflect(stored.id);
  }, [reflect]);

  // Measure and position the strip after the picker is in the DOM but before it paints.
  useLayoutEffect(() => {
    if (!open) return;
    layout();
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open, layout]);

  useEffect(() => {
    if (!open) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (!["Escape", "Enter", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        cancel({ restore: true });
        return;
      }
      if (!pickerRef.current?.contains(event.target as Node)) return;
      event.preventDefault();
      if (event.key === "Enter") apply({ restore: true });
      else move(event.key === "ArrowLeft" ? -1 : 1);
    };
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (pickerRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      cancel();
    };
    const onResize = () => layout();
    const onFocusOut = () => {
      window.requestAnimationFrame(() => {
        const focused = document.activeElement;
        if (!pickerRef.current || pickerRef.current.hidden) return;
        if (!pickerRef.current.contains(focused) && focused !== toggleRef.current) cancel();
      });
    };
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onDocumentClick);
    window.addEventListener("resize", onResize);
    pickerRef.current?.addEventListener("focusout", onFocusOut);
    const picker = pickerRef.current;
    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("click", onDocumentClick);
      window.removeEventListener("resize", onResize);
      picker?.removeEventListener("focusout", onFocusOut);
    };
  }, [apply, cancel, layout, move, open]);

  // Focus follows the selection, scrolling into view only when the strip stacks.
  useEffect(() => {
    if (!open) return;
    const option = pickerRef.current?.querySelectorAll<HTMLButtonElement>("[data-theme-value]")[selected];
    option?.focus({ preventScroll: !compact });
    if (compact) option?.scrollIntoView({ block: "nearest" });
  }, [compact, open, selected]);

  // "T" opens or closes the picker, unless the user is typing or a modifier is held.
  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = /^(input|textarea|select)$/i.test(target?.tagName || "") || target?.isContentEditable === true;
      if (event.key.toLowerCase() !== "t" || event.metaKey || event.ctrlKey || event.altKey || typing) return;
      event.preventDefault();
      if (!open) openPicker();
      else cancel({ restore: true });
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [cancel, open, openPicker]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 760px)");
    const onChange = () => {
      if (open) layout();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [layout, open]);

  return (
    <>
      <button
        ref={toggleRef}
        className="square-action theme-toggle"
        type="button"
        aria-label="Choose color theme"
        onClick={() => (open ? cancel() : openPicker())}
      >
        <svg className="palette-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .9-1.8 2-1.8H17a4 4 0 0 0 4-4c0-4.4-4-7.7-9-7.7Z" />
          <circle cx="7.5" cy="11" r="1.3" />
          <circle cx="10.5" cy="7" r="1.3" />
          <circle cx="15" cy="7.5" r="1.3" />
        </svg>
        <span className="theme-toggle-label">Theme</span>
      </button>
      {open ? (
        <div
          ref={pickerRef}
          className={`theme-picker${ready ? " is-ready" : ""}`}
          style={{ top }}
          aria-label="Choose an Litho theme"
          onWheel={(event) => {
            if (compact) return;
            wheelAccRef.current += event.deltaY + event.deltaX;
            if (Math.abs(wheelAccRef.current) >= 60) {
              move(wheelAccRef.current > 0 ? 1 : -1);
              wheelAccRef.current = 0;
            }
          }}
        >
          <div className="theme-picker-strip" ref={stripRef} style={positions ? { height: positions.height } : undefined}>
            {siteThemes.map((theme, index) => {
              const item = positions?.items[index];
              const style = item
                ? { left: item.left, top: item.top, width: item.width, height: item.height, zIndex: item.zIndex }
                : undefined;
              return (
                <button
                  key={theme.id}
                  className={`theme-picker-item${index === selected ? " is-selected" : ""}`}
                  type="button"
                  tabIndex={index === selected ? 0 : -1}
                  aria-pressed={theme.id === currentId}
                  data-theme-value={theme.id}
                  aria-label={theme.name}
                  hidden={item ? item.hidden : false}
                  style={style}
                  onClick={() => {
                    if (compact || index === selected) {
                      setSelected(index);
                      preview(index);
                      const next = applyTheme(theme.id).id;
                      setCommitted(next);
                      reflect(next);
                      close();
                      restoreFocus();
                      return;
                    }
                    setSelected(index);
                    preview(index);
                  }}
                >
                  <span className="theme-picker-pane" style={{ "--pane-bg": theme.bg, "--pane-accent": theme.accent } as React.CSSProperties}>
                    {themePreviewPath(theme) ? (
                      previewsLoaded ? (
                        <img src={themePreviewPath(theme)} alt="" width="800" height="450" loading="lazy" decoding="async" draggable={false} />
                      ) : null
                    ) : (
                      <span className="theme-picker-swatch" aria-hidden="true">
                        <b />
                        <i />
                        <i />
                        <i />
                      </span>
                    )}
                    <span className="theme-picker-name" aria-hidden="true">
                      {theme.name}
                    </span>
                    <i className="theme-picker-shade" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
          <p className="theme-picker-label" role="status" aria-live="polite" aria-atomic="true">
            <b>{statusText}</b>
            <span className="theme-picker-help">←→ browse · enter apply · esc cancel</span>
          </p>
        </div>
      ) : null}
    </>
  );
}
