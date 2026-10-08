/** Port of the clipboard helpers in site/assets/js/shared.js. */
type ClipboardLike = { writeText?: (value: string) => Promise<void> } | undefined;

export async function writeClipboard(
  value: string,
  {
    clipboard = globalThis.navigator?.clipboard as ClipboardLike,
    documentRef = typeof document === "undefined" ? undefined : document,
  }: { clipboard?: ClipboardLike; documentRef?: Document } = {},
): Promise<boolean> {
  try {
    if (!clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await clipboard.writeText(value);
    return true;
  } catch {
    if (!documentRef?.createElement || !documentRef?.body) return false;
    const area = documentRef.createElement("textarea");
    area.value = value;
    area.style.position = "fixed";
    area.style.opacity = "0";
    documentRef.body.append(area);
    area.select();
    try {
      return Boolean(documentRef.execCommand?.("copy"));
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}