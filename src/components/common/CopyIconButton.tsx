import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyIconButtonProps {
  value: string;
}

export default function CopyIconButton({ value }: CopyIconButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy"
      className="shrink-0 text-muted hover:text-ink"
    >
      {copied ? <Check size={14} className="text-safe" /> : <Copy size={14} />}
    </button>
  );
}
