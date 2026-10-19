import { useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { Save } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { FormFields } from "./FormFields";
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
 *   onSave: (value: Record<string, unknown>) => Promise<unknown>,
 *   onSaved?: (value: Record<string, unknown>) => void,
 *   normalize?: (value: Record<string, unknown>) => Record<string, unknown>,
 *   prepareForValidation?: (value: Record<string, unknown>) => Record<string, unknown>,
 *   isNew?: boolean,
 *   submitLabel?: string,
 * }} props
 */
export function EditorForm({
  fields,
  schema,
  value,
  onSave,
  onSaved,
  normalize = (input) => input,
  prepareForValidation = (input) => input,
  isNew = false,
  submitLabel = "Save changes",
}) {
  const [initialDraft] = useState(() => toDraft(value, fields));
  const [draft, setDraft] = useState(initialDraft);
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

  function handleChange(path, next) {
    setDraft((current) => setAt(current, path, next));
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

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6"
    >
      <FormFields
        fields={fields}
        draft={draft}
        errors={errors}
        onChange={handleChange}
        isNew={isNew}
      />
      {rootError ? (
        <p className="text-sm text-(--color-danger)">{rootError}</p>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-(--color-border) bg-(--color-canvas)/90 px-4 py-3 backdrop-blur sm:-mx-7 sm:px-7">
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
