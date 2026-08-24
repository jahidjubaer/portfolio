import { Loader2, AlertCircle, ArrowUpRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { TextLink } from "../../components/ui/TextLink";
import { VisuallyHidden } from "../../components/ui/VisuallyHidden";
import {
  PHOTOGRAPHY_BLOG_URL,
  isPhotographyBlogConfigured,
} from "../../config/photographyBlog";

/**
 * Loading/error states for the Beyond photography gallery. The empty state
 * (reachable and configured, just zero photographs) is handled by
 * BeyondPage itself with its existing honest placeholder — that is not a
 * failure, so it does not belong in this failure-focused component.
 * @param {{ status: "loading" | "error", message?: string, onRetry?: () => void }} props
 */
export function PhotographyGalleryState({ status, message, onRetry }) {
  if (status === "loading") {
    return (
      <div
        role="status"
        className="flex items-center gap-2 py-12 text-(--color-text-secondary)"
      >
        <Loader2 aria-hidden="true" size={18} className="animate-spin" />
        <span>Loading photography…</span>
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
          {message || "Photography couldn't be loaded right now."}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
          {isPhotographyBlogConfigured ? (
            <TextLink
              href={PHOTOGRAPHY_BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              Visit photography archive
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
