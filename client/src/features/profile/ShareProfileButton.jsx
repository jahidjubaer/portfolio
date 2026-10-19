import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { usePreferences } from "../preferences/usePreferences";
import { siteConfig } from "../../config/site";

/**
 * Copies the profile URL. Uses the native share sheet where the device has
 * one (phones), otherwise the clipboard, and confirms inline — the status
 * is announced through the live region, not only shown as an icon.
 */
export function ShareProfileButton() {
  const { play } = usePreferences();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  async function handleShare() {
    const url = siteConfig.url;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: siteConfig.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      play("success");
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed or clipboard blocked — nothing to report.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share profile link"
        title="Share profile"
        className="hidden size-11 place-items-center rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary) sm:grid"
      >
        {copied ? (
          <Check
            size={18}
            aria-hidden="true"
            className="text-(--color-accent-primary)"
          />
        ) : (
          <Share2 size={18} aria-hidden="true" />
        )}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Profile link copied" : ""}
      </span>
    </>
  );
}
