import { useEffect } from "react";
import { playClickSound } from "../../lib/clickSound";

const CLICKABLE_SELECTOR =
  'button, a, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select';

/**
 * Mounted once near the app root. Delegates a single document-level
 * listener instead of wiring a sound handler into every button so
 * existing components don't need to change.
 */
export default function ClickSoundProvider() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const clickable = target.closest(CLICKABLE_SELECTOR) as HTMLElement | null;
      if (!clickable || (clickable as HTMLButtonElement).disabled) return;
      playClickSound();
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  return null;
}
