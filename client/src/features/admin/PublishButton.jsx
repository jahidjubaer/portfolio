import { useState } from "react";
import { Rocket } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { publishSite } from "./admin-api";

/**
 * Header button that rebuilds the public site from the database. A dot
 * marks saved changes that aren't on the site yet; the result is
 * announced in a status region next to the button.
 * @param {{ publishing: { hasUnpublishedChanges: boolean }, onPublished: () => Promise<void> }} props
 */
export function PublishButton({ publishing, onPublished }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function handlePublish() {
    setBusy(true);
    setStatus("");
    try {
      await publishSite();
      setStatus("Publishing — the site updates in about 2 minutes.");
      await onPublished();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <Button
        size="sm"
        onClick={handlePublish}
        loading={busy}
        leadingIcon={<Rocket size={15} />}
        className="relative"
      >
        {busy ? "Publishing…" : "Publish"}
        {publishing.hasUnpublishedChanges ? (
          <>
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-(--color-canvas) bg-(--color-danger)"
            />
            <span className="sr-only"> (unpublished changes)</span>
          </>
        ) : null}
      </Button>
      {/* Hangs below the header so the bar doesn't change height. */}
      <p
        role="status"
        aria-live="polite"
        className="absolute top-full right-0 z-10 mt-2 w-max max-w-[min(18rem,80vw)] rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs text-(--color-text-secondary) shadow-lg empty:hidden"
      >
        {status}
      </p>
    </div>
  );
}
