/** Admin toasts live in #admin-toast and render `.toast-item` children with a kind modifier. */
export const adminToastEventName = "litho:admin-toast";

export type AdminToastKind = "" | "error" | "success";

export function showAdminToast(message: string, kind: AdminToastKind = "") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<{ message: string; kind: AdminToastKind }>(adminToastEventName, { detail: { message, kind } }));
}
