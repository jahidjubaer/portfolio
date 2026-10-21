import { useRef, useState } from "react";
import { Eye, ImagePlus, Pencil, Trash2, Upload } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Markdown } from "../../../components/ui/Markdown";
import { IMAGE_ACCEPT, uploadImage, uploadPdf } from "../uploads";

export const INPUT =
  "w-full rounded-(--radius-sm) border border-(--color-border-strong) bg-(--color-canvas) px-3 py-2.5 text-[0.9375rem] text-(--color-text-primary) placeholder:text-(--color-text-muted) focus-visible:border-(--color-accent-primary) aria-[invalid=true]:border-(--color-danger) read-only:opacity-70";

export const SMALL_BUTTON =
  "inline-flex min-h-9 items-center gap-1.5 rounded-(--radius-sm) border border-(--color-border) px-2.5 text-sm font-medium text-(--color-text-secondary) hover:border-(--color-border-strong) hover:text-(--color-text-primary) disabled:opacity-40";

/**
 * Runs an upload and tracks its status message for a polite live region.
 * @returns {[string, boolean, (task: () => Promise<void>) => Promise<void>]}
 */
function useUploadStatus() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(task) {
    setBusy(true);
    setMessage("Uploading…");
    try {
      await task();
      setMessage("Uploaded.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return [message, busy, run];
}

/** A hidden file input opened by a visible button. */
function FilePicker({ accept, onFile, inputRef }) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      hidden
      onChange={(event) => {
        const [file] = event.target.files;
        event.target.value = "";
        if (file) onFile(file);
      }}
    />
  );
}

/**
 * An uploaded image: preview, upload/replace, and (when optional) remove.
 * The value is `{ url, width, height }` or null.
 * @param {{
 *   id: string,
 *   value: { url: string, width: number, height: number } | null,
 *   onChange: (value: unknown) => void,
 *   kind: "photo" | "image",
 *   smallWidth?: number,
 *   optional?: boolean,
 *   describedBy?: string,
 *   invalid?: boolean,
 * }} props
 */
export function ImageControl({
  id,
  value,
  onChange,
  kind,
  smallWidth,
  optional,
  describedBy,
  invalid,
}) {
  const inputRef = useRef(null);
  const [message, busy, run] = useUploadStatus();
  const image = value && typeof value === "object" ? value : null;

  return (
    <div className="grid gap-2">
      {image ? (
        <figure className="grid gap-1">
          <img
            src={image.url}
            alt=""
            width={image.width}
            height={image.height}
            className="h-auto max-h-56 w-auto max-w-full rounded-(--radius-md) border border-(--color-border) object-contain"
          />
          <figcaption className="mono-meta text-(--color-text-muted)">
            {image.width} × {image.height}
          </figcaption>
        </figure>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          id={id}
          type="button"
          className={cn(SMALL_BUTTON, invalid && "border-(--color-danger)")}
          aria-describedby={describedBy}
          data-invalid={invalid || undefined}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={14} aria-hidden="true" />
          {image ? "Replace image" : "Upload image"}
        </button>
        {image && optional ? (
          <button
            type="button"
            className={SMALL_BUTTON}
            onClick={() => onChange(null)}
          >
            <Trash2 size={14} aria-hidden="true" />
            Remove image
          </button>
        ) : null}
        <span role="status" className="text-sm text-(--color-text-secondary)">
          {message}
        </span>
      </div>
      <FilePicker
        inputRef={inputRef}
        accept={IMAGE_ACCEPT}
        onFile={(file) =>
          run(async () =>
            onChange(await uploadImage(kind, file, { smallWidth })),
          )
        }
      />
    </div>
  );
}

/**
 * A URL text input with an "Upload PDF" button that fills it in.
 * @param {{
 *   common: Record<string, unknown>,
 *   value: string,
 *   onChange: (value: string) => void,
 * }} props
 */
export function PdfControl({ common, value, onChange }) {
  const inputRef = useRef(null);
  const [message, busy, run] = useUploadStatus();
  return (
    <div className="grid gap-2">
      <input
        {...common}
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={SMALL_BUTTON}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={14} aria-hidden="true" />
          Upload PDF
        </button>
        <span role="status" className="text-sm text-(--color-text-secondary)">
          {message}
        </span>
      </div>
      <FilePicker
        inputRef={inputRef}
        accept="application/pdf"
        onFile={(file) => run(async () => onChange(await uploadPdf(file)))}
      />
    </div>
  );
}

const IMAGE_PLACEHOLDER = "Describe the image";

/**
 * Markdown textarea with a live preview: side by side on wide screens, a
 * Write / Preview switch on narrow ones. "Insert image" uploads a picture
 * and drops `![…](url)` at the cursor with the description selected, so
 * alt text gets written straight away.
 * @param {{
 *   common: Record<string, unknown>,
 *   value: string,
 *   onChange: (value: string) => void,
 *   rows?: number,
 * }} props
 */
export function MarkdownControl({ common, value, onChange, rows = 12 }) {
  const [mode, setMode] = useState("write");
  const textareaRef = useRef(null);
  const inputRef = useRef(null);
  const [message, busy, run] = useUploadStatus();
  const text = value ?? "";
  // Uploads take a moment; insert into the text as it is by then.
  const latestText = useRef(text);
  latestText.current = text;

  function insertImage(url) {
    const text = latestText.current;
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea?.selectionEnd ?? text.length;
    const before = text.slice(0, start);
    const prefix = before === "" || before.endsWith("\n\n") ? "" : "\n\n";
    const snippet = `${prefix}![${IMAGE_PLACEHOLDER}](${url})\n\n`;
    onChange(before + snippet + text.slice(end));
    setMode("write");
    const altStart = start + prefix.length + 2;
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(
        altStart,
        altStart + IMAGE_PLACEHOLDER.length,
      );
    });
  }

  const modeButton = (target, Icon, label) => (
    <button
      type="button"
      className={cn(
        SMALL_BUTTON,
        mode === target &&
          "border-(--color-border-strong) bg-(--color-surface-soft) text-(--color-text-primary)",
      )}
      aria-pressed={mode === target}
      onClick={() => setMode(target)}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </button>
  );

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5 lg:hidden">
          {modeButton("write", Pencil, "Write")}
          {modeButton("preview", Eye, "Preview")}
        </div>
        <button
          type="button"
          className={SMALL_BUTTON}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={14} aria-hidden="true" />
          Insert image
        </button>
        <span role="status" className="text-sm text-(--color-text-secondary)">
          {message}
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          {...common}
          ref={textareaRef}
          rows={rows}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            INPUT,
            "font-mono text-sm leading-relaxed",
            mode === "preview" && "max-lg:hidden",
          )}
        />
        <section
          aria-label="Preview"
          className={cn(
            "min-h-24 overflow-auto rounded-(--radius-sm) border border-dashed border-(--color-border-strong) p-4",
            mode === "write" && "max-lg:hidden",
          )}
        >
          {text.trim() ? (
            <Markdown className="text-[0.9375rem]">{text}</Markdown>
          ) : (
            <p className="text-sm text-(--color-text-muted)">
              The preview appears here as you type.
            </p>
          )}
        </section>
      </div>
      <FilePicker
        inputRef={inputRef}
        accept={IMAGE_ACCEPT}
        onFile={(file) =>
          run(async () => insertImage((await uploadImage("image", file)).url))
        }
      />
    </div>
  );
}
