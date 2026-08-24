import { Loader2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { TextLink } from "../../components/ui/TextLink";
import { VisuallyHidden } from "../../components/ui/VisuallyHidden";
import { BLOG_URL, isBlogConfigured } from "../../config/blog";

/**
 * Non-grid states for the Learning feature: loading, no Blogger URL
 * configured yet, zero published posts, or an upstream failure. Kept as one
 * component (rather than four) since each branch is a few lines and they
 * share the same layout slot in LearningPage/LearningPreview.
 * @param {{
 *   status: "loading" | "config-missing" | "empty" | "error",
 *   message?: string,
 *   onRetry?: () => void,
 * }} props
 */
export function LearningPostsState({ status, message, onRetry }) {
  if (status === "loading") {
    return (
      <div
        role="status"
        className="flex items-center gap-2 py-12 text-(--color-text-secondary)"
      >
        <Loader2 aria-hidden="true" size={18} className="animate-spin" />
        <span>Loading learning notes…</span>
      </div>
    );
  }

  if (status === "config-missing") {
    return (
      <p className="body-sm py-12 text-(--color-text-secondary)">
        Learning notes are being prepared.
      </p>
    );
  }

  if (status === "empty") {
    return (
      <div className="py-12">
        <p className="body-sm text-(--color-text-secondary)">
          No published notes yet.
        </p>
        <p className="body-sm mt-2 text-(--color-text-muted)">
          New writing will appear here automatically when it&apos;s published on
          Blogger.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-12">
        <p
          role="alert"
          className="body-sm flex items-center gap-2 text-(--color-danger)"
        >
          <AlertCircle aria-hidden="true" size={18} />
          {message || "Learning posts couldn't be loaded right now."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
          {isBlogConfigured ? (
            <TextLink
              href={BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              Visit Blogger
              <ArrowUpRight aria-hidden="true" size={14} />
              <VisuallyHidden>(opens in a new tab)</VisuallyHidden>
            </TextLink>
          ) : null}
        </div>
      </div>
    );
  }

  return null;
}
