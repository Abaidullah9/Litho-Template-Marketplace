"use client";

import { useEffect, useRef, useState } from "react";
import { writeClipboard } from "@/lib/clipboard";
import { showToast } from "@/lib/toast";

type CopyButtonProps = {
  value: string;
  /** Omitted on the blocks the hand-written pages left unlabelled. */
  ariaLabel?: string;
  /** Text shown before the click; the legacy markup always reads "Copy". */
  label?: string;
  duration?: number;
};

/** Port of shared.js `copyText`: writes the clipboard, then confirms on the button and the toast. */
export function CopyButton({ value, ariaLabel, label = "Copy", duration = 1400 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      className="copy-button"
      type="button"
      data-copy={value}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      onClick={async () => {
        if (!value) return;
        if (!(await writeClipboard(value))) {
          showToast("Copy failed. Select and copy manually.");
          return;
        }
        setCopied(true);
        showToast("Copied to clipboard");
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), duration);
      }}
    >
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
