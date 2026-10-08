"use client";

import { useEffect, useState } from "react";
import { toastEventName } from "@/lib/toast";

/** The page-level status toast: #toast, shown for 1.8s exactly like the legacy helper. */
export function Toast() {
  const [message, setMessage] = useState("Copied");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let timer = 0;
    const onToast = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail || "Copied to clipboard");
      setShown(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setShown(false), 1800);
    };
    window.addEventListener(toastEventName, onToast);
    return () => {
      window.removeEventListener(toastEventName, onToast);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`toast${shown ? " show" : ""}`} id="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
