import { CopyButton } from "@/components/site/copy-button";

type CodeBlockProps = {
  /** Left-hand label in the code head, e.g. "Terminal · validate". */
  title: React.ReactNode;
  /** Clipboard payload; omit for blocks that are illustrations rather than commands. */
  copy?: { value: string; ariaLabel?: string };
  children: React.ReactNode;
};

/**
 * The `.code-block` shell used across the documentation pages. The head keeps the two-part label
 * of the hand-written pages and only gains a copy button when there is something to copy.
 */
export function CodeBlock({ title, copy, children }: CodeBlockProps) {
  return (
    <div className="code-block">
      <div className="code-head">
        <span>{title}</span>
        {copy ? <CopyButton value={copy.value} ariaLabel={copy.ariaLabel} /> : null}
      </div>
      {children}
    </div>
  );
}
