import { useId, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "../../../lib/cn";
import { getAt } from "./draft";
import { INPUT, SMALL_BUTTON } from "./MediaFields";
import {
  REPO_ROLES,
  addRepoLink,
  linkLabelFor,
  repoNameFromUrl,
  roleFromLabel,
} from "../repo-links";

/**
 * "GitHub repositories": any number of synced repos, each with a role
 * (Client / Server / Docs / Other). It edits the `repository` entries of
 * the field named in `field.for` (the project's links), so the Links list
 * below shows the same entries.
 * @param {{
 *   field: import("./draft").Field & { for: string, repos: Array<{ name: string, url: string }>, username: string },
 *   draft: Record<string, unknown>,
 *   onChange: (path: string, value: unknown) => void,
 * }} props
 */
export function RepoLinksField({ field, draft, onChange }) {
  const id = useId();
  const links = getAt(draft, field.for) ?? [];
  const picked = links
    .map((link, index) => ({
      index,
      link,
      name:
        link.type === "repository"
          ? repoNameFromUrl(link.url, field.username)
          : null,
    }))
    .filter((entry) => entry.name);
  const pickedNames = new Set(picked.map((entry) => entry.name));
  const choices = field.repos.filter((repo) => !pickedNames.has(repo.name));
  const [choice, setChoice] = useState("");
  const selected = choices.some((repo) => repo.name === choice)
    ? choice
    : (choices[0]?.name ?? "");

  function update(next) {
    onChange(field.for, next);
  }

  function handleAdd() {
    const repo = choices.find((entry) => entry.name === selected);
    if (repo) update(addRepoLink(links, repo, field.username));
  }

  function handleRole(index, role) {
    update(
      links.map((link, i) =>
        i === index ? { ...link, label: linkLabelFor(role) } : link,
      ),
    );
  }

  return (
    <fieldset
      aria-describedby={`${id}-hint`}
      className="grid gap-3 rounded-(--radius-md) border border-(--color-border) p-4"
    >
      <legend className="px-1 text-sm font-semibold text-(--color-text-primary)">
        {field.label}
      </legend>
      <p id={`${id}-hint`} className="text-xs text-(--color-text-muted)">
        {field.hint}
      </p>
      {picked.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">
          No repositories yet.
        </p>
      ) : (
        <ul className="grid gap-2">
          {picked.map(({ index, link, name }) => (
            <li
              key={name}
              className="flex flex-wrap items-center gap-2 rounded-(--radius-sm) bg-(--color-surface-raised) p-2.5"
            >
              <span className="min-w-0 flex-1 basis-40 font-medium break-all text-(--color-text-primary)">
                {name}
              </span>
              <label className="sr-only" htmlFor={`${id}-role-${index}`}>
                Role of {name}
              </label>
              <select
                id={`${id}-role-${index}`}
                value={roleFromLabel(link.label)}
                onChange={(event) => handleRole(index, event.target.value)}
                className={cn(INPUT, "w-auto")}
              >
                {REPO_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={SMALL_BUTTON}
                onClick={() => update(links.filter((_, i) => i !== index))}
                aria-label={`Remove ${name}`}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {field.repos.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">
          Sync your GitHub repos first (GitHub repos page).
        </p>
      ) : null}
      {choices.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`${id}-add`}>
            Repository to add
          </label>
          <select
            id={`${id}-add`}
            value={selected}
            onChange={(event) => setChoice(event.target.value)}
            className={cn(INPUT, "w-auto max-w-full flex-1 basis-48")}
          >
            {choices.map((repo) => (
              <option key={repo.name} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
          <button type="button" className={SMALL_BUTTON} onClick={handleAdd}>
            <Plus size={14} aria-hidden="true" />
            Add repository
          </button>
        </div>
      ) : null}
    </fieldset>
  );
}
