import { useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { Eye, Save } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../lib/cn";
import { FormFields } from "./FormFields";
import { PreviewBoundary } from "./PreviewBoundary";
import { fromDraft, issuesToErrors, setAt, toDraft } from "./draft";

/**
 * Generic editor: renders `fields`, validates with the same Zod schema the
 * server uses, saves through `onSave`, maps server field errors back onto
 * the inputs, and guards unsaved changes (in-app navigation and tab close).
 *
 * @param {{
 *   fields: import("./draft").Field[],
 *   schema: import("zod").ZodType,
 *   value: Record<string, unknown>,
 *   startValue?: Record<string, unknown>,
 *   onSave: (value: Record<string, unknown>) => Promise<unknown>,
 *   onSaved?: (value: Record<string, unknown>) => void,
 *   normalize?: (value: Record<string, unknown>) => Record<string, unknown>,
 *   prepareForValidation?: (value: Record<string, unknown>) => Record<string, unknown>,
 *   isNew?: boolean,
 *   submitLabel?: string,
 *   preview?: (value: Record<string, unknown>) => import("react").ReactNode,
 *   assist?: (api: { values: Record<string, unknown>, apply: (values: Record<string, unknown>) => void }) => import("react").ReactNode,
 * }} props
 *
 * With `preview`, the unsaved values are also rendered beside the form the
 * way the public site will show them. Ctrl/⌘+S saves. `assist` renders
 * above the fields with the current values and `apply`, which merges
 * values into the draft (unsaved, so they can be reviewed first).
 * `startValue` opens the form with unsaved changes already made to
 * `value` (e.g. a repo added from the GitHub repos page).
 */
export function EditorForm({
  fields,
  schema,
  value,
  startValue,
  onSave,
  onSaved,
  normalize = (input) => input,
  prepareForValidation = (input) => input,
  isNew = false,
  submitLabel = "Save changes",
  preview,
  assist,
}) {
  const [initialDraft] = useState(() => toDraft(value, fields));
  const [draft, setDraft] = useState(() =>
    startValue ? toDraft(startValue, fields) : initialDraft,
  );
  const [savedDraft, setSavedDraft] = useState(initialDraft);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // { tone, message }
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);
  // The blocker reads the latest saved state synchronously, so `onSaved`
  // can navigate away right after a save without being blocked.
  const savedRef = useRef(initialDraft);
  const draftRef = useRef(initialDraft);
  draftRef.current = draft;

  const dirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname &&
      JSON.stringify(draftRef.current) !== JSON.stringify(savedRef.current),
  );

  useEffect(() => {
    if (!dirty) return undefined;
    function warn(event) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleChange(path, next) {
    setDraft((current) => setAt(current, path, next));
  }

  function applyValues(values) {
    setDraft((current) =>
      toDraft({ ...fromDraft(current, fields), ...values }, fields),
    );
    setStatus({
      tone: "info",
      message: "Draft applied. Check every field, then save.",
    });
  }

  function focusFirstError() {
    // After React paints the error state.
    requestAnimationFrame(() => {
      // Upload buttons can't carry aria-invalid, so they use data-invalid.
      formRef.current
        ?.querySelector("[aria-invalid='true'], [data-invalid='true']")
        ?.focus();
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const output = normalize(fromDraft(draft, fields));
    const result = schema.safeParse(prepareForValidation(output));
    if (!result.success) {
      setErrors(issuesToErrors(result.error.issues));
      setStatus({ tone: "error", message: "Some fields need attention." });
      focusFirstError();
      return;
    }

    setSaving(true);
    setStatus({ tone: "info", message: "Saving…" });
    try {
      await onSave(output);
      savedRef.current = draft;
      setErrors({});
      setSavedDraft(draft);
      setStatus({ tone: "success", message: "Saved." });
      onSaved?.(output);
    } catch (error) {
      setErrors(issuesToErrors(error.issues ?? []));
      setStatus({ tone: "error", message: error.message });
      if (error.issues?.length) focusFirstError();
    } finally {
      setSaving(false);
    }
  }

  const rootError = errors[""];
  const previewValue = preview ? normalize(fromDraft(draft, fields)) : null;
  const previewContent = preview ? (
    <aside
      aria-labelledby="preview-heading"
      className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4 xl:sticky xl:top-20"
    >
      <h2
        id="preview-heading"
        className="mono-meta mb-4 flex items-center gap-2 text-(--color-text-muted)"
      >
        <Eye size={14} aria-hidden="true" />
        Preview, as it will look on the site
      </h2>
      <PreviewBoundary value={JSON.stringify(previewValue)}>
        {preview(previewValue) ?? (
          <p className="text-sm text-(--color-text-muted)">
            Fill in the form to see a preview.
          </p>
        )}
      </PreviewBoundary>
    </aside>
  ) : null;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "grid gap-6",
        preview && "xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start",
      )}
    >
      {assist ? (
        <div className="xl:col-span-full">
          {assist({ values: fromDraft(draft, fields), apply: applyValues })}
        </div>
      ) : null}
      <FormFields
        fields={fields}
        draft={draft}
        errors={errors}
        onChange={handleChange}
        isNew={isNew}
      />
      {previewContent}
      {rootError ? (
        <p className="text-sm text-(--color-danger) xl:col-span-full">
          {rootError}
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex xl:col-span-full flex-wrap items-center gap-3 border-t border-(--color-border) bg-(--color-canvas)/90 px-4 py-3 backdrop-blur sm:-mx-7 sm:px-7">
        <Button
          type="submit"
          disabled={saving}
          leadingIcon={<Save size={16} />}
        >
          {submitLabel}
        </Button>
        <p
          role="status"
          aria-live="polite"
          className={
            status?.tone === "error"
              ? "text-sm text-(--color-danger)"
              : "text-sm text-(--color-text-secondary)"
          }
        >
          {status?.message ?? (dirty ? "Unsaved changes" : "")}
        </p>
        <p className="ml-auto hidden text-xs text-(--color-text-muted) sm:block">
          <kbd className="font-mono">Ctrl</kbd>/
          <kbd className="font-mono">⌘</kbd> +{" "}
          <kbd className="font-mono">S</kbd> saves
        </p>
      </div>

      {blocker.state === "blocked" ? (
        <div
          role="alertdialog"
          aria-labelledby="unsaved-title"
          className="fixed inset-x-4 bottom-4 z-(--z-overlay) mx-auto max-w-md rounded-(--radius-lg) border border-(--color-border-strong) bg-(--color-surface) p-4 shadow-(--shadow-md)"
        >
          <p
            id="unsaved-title"
            className="font-semibold text-(--color-text-primary)"
          >
            Leave without saving?
          </p>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Your unsaved changes on this page will be lost.
          </p>
          <div className="mt-3 flex gap-2">
            {/* eslint-disable-next-line jsx-a11y/no-autofocus -- the dialog's safe default action */}
            <Button size="sm" onClick={() => blocker.reset()} autoFocus>
              Stay
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => blocker.proceed()}
            >
              Leave
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
