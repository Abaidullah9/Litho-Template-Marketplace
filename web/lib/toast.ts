/** The page-level status toast, wired to the #toast element every shell renders. */
export const toastEventName = "litho:toast";

export function showToast(message = "Copied to clipboard") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(toastEventName, { detail: message }));
}