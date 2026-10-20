import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Import, Upload } from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { createListItem } from "../../features/admin/admin-api";
import { Button } from "../../components/ui/Button";
import {
  buildLinkedInImport,
  LINKEDIN_FILES,
} from "../../../../server/src/db/linkedin-import.js";
import { AdminPageHeader } from "./AdminPageHeader";

const COLLECTION_LABELS = {
  certifications: "Licenses & certifications",
  education: "Education",
  experience: "Experience",
};

function readText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/** Reads only the export's career files; everything else is ignored. */
async function readExportFiles(fileList) {
  const files = {};
  for (const file of fileList) {
    if (LINKEDIN_FILES.includes(file.name)) {
      files[file.name] = await readText(file);
    }
  }
  return files;
}

/**
 * Import from a LinkedIn data export: pick the CSVs, review what's new,
 * and add the ticked items (with any organizations they need). Files are
 * read in the browser; only the items you add reach the server.
 */
export function AdminLinkedInImportPage() {
  const { content, reload } = useAdmin();
  const inputId = useId();
  const [result, setResult] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function handleFiles(event) {
    const files = await readExportFiles(event.target.files ?? []);
    const names = Object.keys(files);
    setFileNames(names);
    if (names.length === 0) {
      setResult(null);
      setStatus(
        "None of those files are career files from the export. Pick the CSVs listed above.",
      );
      return;
    }
    const built = buildLinkedInImport(files, content);
    setResult(built);
    setSelected(
      new Set(
        built.candidates
          .filter((candidate) => !candidate.exists)
          .map((candidate) => candidate.key),
      ),
    );
    setStatus("");
  }

  function toggle(key) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleImport() {
    const chosen = result.candidates.filter((candidate) =>
      selected.has(candidate.key),
    );
    setBusy(true);
    setStatus(`Adding ${chosen.length} items…`);
    const createdOrgs = new Set();
    let added = 0;
    try {
      for (const candidate of chosen) {
        const org = candidate.newOrganization;
        if (org && !createdOrgs.has(org.id)) {
          await createListItem("organizations", org);
          createdOrgs.add(org.id);
        }
        await createListItem(candidate.collection, candidate.item);
        added += 1;
      }
      setStatus(
        `Added ${added} items${createdOrgs.size ? ` and ${createdOrgs.size} organizations` : ""}. Review them, add logos, then Publish.`,
      );
      setResult(null);
      setFileNames([]);
    } catch (error) {
      setStatus(`Stopped after ${added} items: ${error.message}`);
    } finally {
      await reload();
      setBusy(false);
    }
  }

  const groups = result
    ? Object.keys(COLLECTION_LABELS)
        .map((collection) => ({
          collection,
          items: result.candidates.filter(
            (candidate) => candidate.collection === collection,
          ),
        }))
        .filter((group) => group.items.length > 0)
    : [];

  return (
    <>
      <AdminPageHeader
        title="Import from LinkedIn"
        description="Add certifications, roles, and education from your LinkedIn data export. Nothing on the site is overwritten."
      />
      <ol className="mb-5 grid list-decimal gap-1 pl-5 text-sm text-(--color-text-secondary)">
        <li>
          LinkedIn → Settings → Data privacy → Get a copy of your data. Unzip
          the download.
        </li>
        <li>
          Pick these files from it:{" "}
          <span className="font-mono text-(--color-text-primary)">
            {LINKEDIN_FILES.join(", ")}
          </span>
          . Other files (contacts, messages, phone numbers) are ignored and
          never uploaded.
        </li>
        <li>Untick anything you don&apos;t want, then add the rest.</li>
      </ol>

      <label
        htmlFor={inputId}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-surface-raised) px-4 text-sm font-medium text-(--color-text-primary) focus-within:outline-2 focus-within:outline-(--color-accent-primary)"
      >
        <Upload size={16} aria-hidden="true" />
        Choose CSV files
        <input
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={handleFiles}
          className="sr-only"
        />
      </label>
      {fileNames.length ? (
        <p className="mt-2 text-sm text-(--color-text-muted)">
          Read: {fileNames.join(", ")}
        </p>
      ) : null}

      <p
        role="status"
        aria-live="polite"
        className="my-3 min-h-5 text-sm text-(--color-text-secondary)"
      >
        {status}
      </p>

      {groups.map((group) => (
        <fieldset key={group.collection} className="mb-5">
          <legend className="mb-2 font-semibold text-(--color-text-primary)">
            {COLLECTION_LABELS[group.collection]}
          </legend>
          <ul className="grid gap-2">
            {group.items.map((candidate) => (
              <li key={candidate.key}>
                <label className="flex min-h-11 items-start gap-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4"
                    checked={selected.has(candidate.key)}
                    disabled={candidate.exists}
                    onChange={() => toggle(candidate.key)}
                  />
                  <span className="flex-1">
                    <span className="block font-medium text-(--color-text-primary)">
                      {candidate.label}
                    </span>
                    <span className="block text-(--color-text-muted)">
                      {candidate.detail}
                      {candidate.newOrganization
                        ? ` · adds organization “${candidate.newOrganization.name}”`
                        : null}
                    </span>
                    {candidate.exists ? (
                      <span className="block text-(--color-text-secondary)">
                        Already on the site. {candidate.note ?? ""}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ))}

      {result?.skipped.length ? (
        <div className="mb-5 text-sm text-(--color-text-secondary)">
          <p className="font-medium text-(--color-text-primary)">
            Not imported
          </p>
          <ul className="mt-1 list-disc pl-5">
            {result.skipped.map((item) => (
              <li key={`${item.file}-${item.label}`}>
                {item.label} — {item.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result ? (
        <Button
          onClick={handleImport}
          disabled={busy || selected.size === 0}
          leadingIcon={<Import size={16} />}
        >
          {busy ? "Adding…" : `Add ${selected.size} items`}
        </Button>
      ) : null}

      <p className="mt-6 text-sm text-(--color-text-muted)">
        After importing, check the new entries under{" "}
        <Link to="/admin/certifications" className="underline">
          Certifications
        </Link>
        ,{" "}
        <Link to="/admin/experience" className="underline">
          Experience
        </Link>
        , and{" "}
        <Link to="/admin/education" className="underline">
          Education
        </Link>
        .
      </p>
    </>
  );
}
