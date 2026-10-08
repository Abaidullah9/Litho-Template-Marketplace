"use client";

import { useEffect, useState } from "react";
import { adminToastEventName, type AdminToastKind } from "@/lib/admin-toast";

type ToastItem = { id: number; message: string; kind: AdminToastKind };

/** Port of admin.js `toast()`: items append, then remove themselves after 4.2s. */
export function AdminToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let nextId = 0;
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; kind?: AdminToastKind }>).detail || {};
      const id = (nextId += 1);
      const item: ToastItem = { id, message: detail.message || "", kind: detail.kind || "" };
      setItems((current) => [...current, item]);
      window.setTimeout(() => setItems((current) => current.filter((entry) => entry.id !== id)), 4200);
    };
    window.addEventListener(adminToastEventName, onToast);
    return () => window.removeEventListener(adminToastEventName, onToast);
  }, []);

  return (
    <div className="admin-toast" id="admin-toast" role="status" aria-live="polite">
      {items.map((item) => (
        <div className={`toast-item ${item.kind}`} key={item.id}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
