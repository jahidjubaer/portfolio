import { useId, useState } from "react";
import { Lock, Plus } from "lucide-react";
import { useAdmin } from "./admin-context";
import { createListItem } from "./admin-api";
import { INPUT } from "./form/MediaFields";
import { syllabusTopics, trackOptions } from "./journal-options";
import { siteDateKey } from "../learning-tracks/journal";
import { Button } from "../../components/ui/Button";

const LABEL = "mb-1 block text-sm font-medium text-(--color-text-primary)";

function blankEntry(trackId = "") {
  return {
    date: siteDateKey(new Date()),
    trackId,
    topic: "",
    body: "",
    minutes: "",
    private: false,
  };
}

/**
 * "What did you study today?": one short form above the study log, so a
 * session takes under a minute to record. The full editor (links,
 * Markdown preview) is still there for each entry.
 */
export function StudyLogQuickAdd() {
  const { content, reload } = useAdmin();
  const id = useId();
  const tracks = trackOptions(content);
  const [entry, setEntry] = useState(() => blankEntry(tracks[0]?.value));
  const [issues, setIssues] = useState({});
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const topics = syllabusTopics(content, entry.trackId);

  if (tracks.length === 0) {
    return (
      <p className="mb-5 rounded-(--radius-lg) border border-dashed border-(--color-border-strong) p-4 text-sm text-(--color-text-secondary)">
        Add a learning track first; every entry belongs to one.
      </p>
    );
  }

  function set(name, value) {
    setEntry((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setIssues({});
    setStatus("Saving…");
    try {
      await createListItem("studyLog", {
        id: `log-${Date.now().toString(36)}`,
        date: entry.date,
        trackId: entry.trackId,
        topic: entry.topic.trim() || undefined,
        body: entry.body.trim(),
        minutes: entry.minutes === "" ? undefined : Number(entry.minutes),
        links: [],
        visibility: entry.private ? "private" : undefined,
      });
      await reload();
      setEntry(blankEntry(entry.trackId));
      setStatus("Logged. Publish to show it on the site.");
    } catch (error) {
      setIssues(
        Object.fromEntries(
          (error.issues ?? []).map((issue) => [issue.path, issue.message]),
        ),
      );
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  const fieldProps = (name) => ({
    id: `${id}-${name}`,
    "aria-invalid": issues[name] ? true : undefined,
    "aria-describedby": issues[name] ? `${id}-${name}-error` : undefined,
  });
  const error = (name) =>
    issues[name] ? (
      <p
        id={`${id}-${name}-error`}
        className="mt-1 text-sm text-(--color-danger)"
      >
        {issues[name]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby={`${id}-title`}
      className="mb-5 grid gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4"
    >
      <h2
        id={`${id}-title`}
        className="font-semibold text-(--color-text-primary)"
      >
        What did you study today?
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor={`${id}-date`} className={LABEL}>
            Date
          </label>
          <input
            {...fieldProps("date")}
            type="date"
            required
            value={entry.date}
            onChange={(event) => set("date", event.target.value)}
            className={INPUT}
          />
          {error("date")}
        </div>
        <div>
          <label htmlFor={`${id}-trackId`} className={LABEL}>
            Track
          </label>
          <select
            {...fieldProps("trackId")}
            value={entry.trackId}
            onChange={(event) => set("trackId", event.target.value)}
            className={INPUT}
          >
            {tracks.map((track) => (
              <option key={track.value} value={track.value}>
                {track.label}
              </option>
            ))}
          </select>
          {error("trackId")}
        </div>
        <div>
          <label htmlFor={`${id}-minutes`} className={LABEL}>
            Minutes (optional)
          </label>
          <input
            {...fieldProps("minutes")}
            type="number"
            min="1"
            max="1440"
            inputMode="numeric"
            value={entry.minutes}
            onChange={(event) => set("minutes", event.target.value)}
            className={INPUT}
          />
          {error("minutes")}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-topic`} className={LABEL}>
          Topic (optional)
        </label>
        <input
          {...fieldProps("topic")}
          list={topics.length ? `${id}-topics` : undefined}
          value={entry.topic}
          onChange={(event) => set("topic", event.target.value)}
          className={INPUT}
        />
        {topics.length ? (
          <datalist id={`${id}-topics`}>
            {topics.map((topic) => (
              <option key={topic} value={topic} />
            ))}
          </datalist>
        ) : null}
        {error("topic")}
      </div>
      <div>
        <label htmlFor={`${id}-body`} className={LABEL}>
          What I studied
        </label>
        <textarea
          {...fieldProps("body")}
          required
          rows={3}
          value={entry.body}
          onChange={(event) => set("body", event.target.value)}
          placeholder="A few lines, in your own words. Markdown works."
          className={INPUT}
        />
        {error("body")}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex min-h-11 items-center gap-2 text-sm text-(--color-text-secondary)">
          <input
            type="checkbox"
            checked={entry.private}
            onChange={(event) => set("private", event.target.checked)}
            className="size-4 accent-(--color-accent-primary)"
          />
          <Lock size={14} aria-hidden="true" />
          Private (only here in the admin)
        </label>
        <Button type="submit" disabled={busy} leadingIcon={<Plus size={16} />}>
          Log it
        </Button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="min-h-5 text-sm text-(--color-text-secondary)"
      >
        {status}
      </p>
    </form>
  );
}
