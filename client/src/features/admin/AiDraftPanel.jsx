import { useId, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { draftFromRepo } from "./admin-api";
import { linkedRepoNames } from "./repo-links";

const INPUT =
  "min-h-11 w-full rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-canvas) px-3 text-(--color-text-primary)";

/** The repos a project or track already points at. */
function linkedRepos(kind, values, username) {
  if (kind === "learning") return values.repos ?? [];
  return [...new Set(linkedRepoNames(values.links, username))];
}

function draftLabel(busy, repoCount) {
  if (busy) return "Drafting…";
  return repoCount > 1 ? `Draft from ${repoCount} repos` : "Draft from repo";
}

/**
 * Merges an AI draft into the form values. A written case study and
 * missing-content notes are kept: the draft only fills an empty case
 * study and adds notes.
 */
function mergeDraft(kind, values, draft) {
  const { missingContent = [], ...fields } = draft;
  if (kind === "learning") {
    return {
      ...fields,
      repos: [...new Set([...(values.repos ?? []), ...fields.repos])],
      since: values.since || fields.since,
    };
  }
  const hasCaseStudy = Boolean(values.caseStudy?.sections?.length);
  const caseStudy =
    hasCaseStudy || !fields.caseStudy
      ? values.caseStudy
      : { ...values.caseStudy, sections: fields.caseStudy.sections };
  return {
    ...fields,
    caseStudy,
    missingContent: [
      ...new Set([...(values.missingContent ?? []), ...missingContent]),
    ],
  };
}

/**
 * "Draft with AI": reads synced public repos (README, manifests,
 * languages, commits) on the server and fills the form. A project with
 * several repos (client + server) is drafted from all of the ticked ones
 * at once. Nothing is saved until Jahid reviews it and presses Save.
 * @param {{
 *   kind: "project" | "learning",
 *   content: Record<string, any>,
 *   values: Record<string, any>,
 *   apply: (values: Record<string, unknown>) => void,
 * }} props
 */
export function AiDraftPanel({ kind, content, values, apply }) {
  const selectId = useId();
  const { repos = [], username } = content.repositories ?? {};
  const choices = repos.filter((repo) => !repo.fork);
  const linked = linkedRepos(kind, values, username);
  // A project's linked repos are ticked by default, including ones added
  // later in the form; the select is for anything not linked yet.
  const multi = kind === "project" && linked.length > 0;
  const [unticked, setUnticked] = useState(() => new Set());
  const [repo, setRepo] = useState(() => linked[0] || choices[0]?.name || "");
  const selected = multi
    ? linked.filter((name) => !unticked.has(name))
    : [repo].filter(Boolean);

  function toggle(name, checked) {
    setUnticked((current) => {
      const next = new Set(current);
      if (checked) next.delete(name);
      else next.add(name);
      return next;
    });
  }
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { tone, message }
  const [notes, setNotes] = useState([]);

  async function handleDraft() {
    setBusy(true);
    setStatus({
      tone: "info",
      message: `Reading ${selected.join(" and ")} and drafting…`,
    });
    try {
      const draft = await draftFromRepo(kind, selected);
      apply(mergeDraft(kind, values, draft));
      setNotes(draft.missingContent ?? []);
      setStatus({
        tone: "success",
        message:
          "Draft filled in below. Read every field and correct it before saving.",
      });
    } catch (error) {
      setStatus({ tone: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby={`${selectId}-title`}
      className="rounded-(--radius-lg) border border-dashed border-(--color-accent-primary)/45 bg-(--color-accent-primary-soft)/40 p-4"
    >
      <h2
        id={`${selectId}-title`}
        className="flex items-center gap-2 font-semibold text-(--color-text-primary)"
      >
        <Sparkles
          size={17}
          aria-hidden="true"
          className="text-(--color-accent-primary)"
        />
        Draft with AI
      </h2>
      <p className="mt-1 text-sm text-(--color-text-secondary)">
        Reads{" "}
        {kind === "project" ? "the project's public repos" : "a public repo"}{" "}
        (README, packages, languages, commits) and fills the{" "}
        {kind === "project" ? "project" : "track"} fields. It only uses what the
        repo shows — no invented numbers — and nothing is saved until you press
        Save.
      </p>

      {content.aiConfigured ? null : (
        <p className="mt-2 text-sm text-(--color-danger)">
          Not configured on this server: set <code>AI_GATEWAY_API_KEY</code> (on
          Vercel it works without one).
        </p>
      )}

      {choices.length === 0 && !multi ? (
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Sync your GitHub repos first (GitHub repos page).
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          {multi ? (
            <fieldset className="flex-1 basis-56">
              <legend className="text-sm font-medium text-(--color-text-primary)">
                Repositories to read
              </legend>
              <div className="flex flex-wrap gap-x-4">
                {linked.map((name) => (
                  <label
                    key={name}
                    className="flex min-h-11 items-center gap-2 text-[0.9375rem] text-(--color-text-primary)"
                  >
                    <input
                      type="checkbox"
                      checked={!unticked.has(name)}
                      onChange={(event) => toggle(name, event.target.checked)}
                      className="size-5 shrink-0 accent-(--color-accent-fill)"
                    />
                    {name}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <label htmlFor={selectId} className="grid flex-1 basis-56 gap-1">
              <span className="text-sm font-medium text-(--color-text-primary)">
                Repository
              </span>
              <select
                id={selectId}
                value={repo}
                onChange={(event) => setRepo(event.target.value)}
                className={INPUT}
              >
                {choices.map((choice) => (
                  <option key={choice.id} value={choice.name}>
                    {choice.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button
            variant="secondary"
            onClick={handleDraft}
            disabled={busy || selected.length === 0 || !content.aiConfigured}
            leadingIcon={
              <Sparkles
                size={16}
                className={busy ? "motion-safe:animate-pulse" : undefined}
              />
            }
          >
            {draftLabel(busy, selected.length)}
          </Button>
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        className={
          status?.tone === "error"
            ? "mt-2 min-h-5 text-sm text-(--color-danger)"
            : "mt-2 min-h-5 text-sm text-(--color-text-secondary)"
        }
      >
        {status?.message}
      </p>
      {notes.length ? (
        <div className="mt-1 text-sm text-(--color-text-secondary)">
          <p className="font-medium text-(--color-text-primary)">
            The repo didn&apos;t say — add these yourself:
          </p>
          <ul className="mt-1 list-disc pl-5">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
