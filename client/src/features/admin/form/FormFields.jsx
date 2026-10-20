import { useId } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cn } from "../../../lib/cn";
import { errorFor, getAt, toDraft } from "./draft";
import { QuickAddOrganization } from "./QuickAddOrganization";
import { RepoLinksField } from "./RepoLinksField";
import {
  INPUT,
  ImageControl,
  MarkdownControl,
  PdfControl,
  SMALL_BUTTON,
} from "./MediaFields";

const LABEL = "text-sm font-semibold text-(--color-text-primary)";

// Fields take the full row unless marked `half`, which pairs them up
// (start and end dates, location and location type) from sm up.
function fieldSpan(field) {
  return field.half ? undefined : "sm:col-span-2";
}

const LIST_HINTS = {
  lines: "One per line.",
  paragraphs: "Separate paragraphs with an empty line.",
  json: "Advanced: JSON. Leave empty for none.",
  markdown:
    "Markdown: **bold**, *italic*, ## Heading, - list item, [link text](https://…).",
};

/**
 * One labelled input with its hint and error wired up for screen readers.
 * @param {{
 *   field: import("./draft").Field,
 *   path: string,
 *   draft: Record<string, unknown>,
 *   errors: Record<string, string>,
 *   onChange: (path: string, value: unknown) => void,
 *   isNew: boolean,
 * }} props
 */
function Field({ field, path, draft, errors, onChange, isNew }) {
  const id = useId();
  if (field.type === "heading") {
    return (
      <h2 className="mt-3 border-b border-(--color-border) pb-2 text-[1.0625rem] font-semibold text-(--color-text-primary)">
        {field.label}
        {field.hint ? (
          <span className="mt-0.5 block text-sm font-normal text-(--color-text-secondary)">
            {field.hint}
          </span>
        ) : null}
      </h2>
    );
  }
  if (field.type === "related") {
    return <RelatedField field={field} />;
  }
  if (field.type === "repoLinks") {
    return <RepoLinksField field={field} draft={draft} onChange={onChange} />;
  }
  const type = field.type ?? "text";
  const value = getAt(draft, path);
  const error = errorFor(errors, path, type !== "objectList");
  const hint = field.hint ?? LIST_HINTS[type];
  const optionalMark =
    field.optional || field.nullable ? (
      <span className="ml-1.5 font-normal text-(--color-text-muted)">
        optional
      </span>
    ) : null;
  const describedBy =
    [
      type === "image" ? `${id}-label` : null,
      hint ? `${id}-hint` : null,
      error ? `${id}-error` : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  const common = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    readOnly: field.readOnlyWhenEditing && !isNew,
  };

  if (type === "objectList") {
    return (
      <ObjectListField
        field={field}
        path={path}
        draft={draft}
        errors={errors}
        onChange={onChange}
        isNew={isNew}
      />
    );
  }

  let control;
  if (type === "image") {
    control = (
      <ImageControl
        id={id}
        value={value}
        onChange={(next) => onChange(path, next)}
        kind={field.uploadKind ?? "image"}
        optional={field.optional}
        describedBy={describedBy}
        invalid={Boolean(error)}
      />
    );
  } else if (type === "pdf") {
    control = (
      <PdfControl
        common={common}
        value={value}
        onChange={(next) => onChange(path, next)}
      />
    );
  } else if (type === "markdown") {
    control = (
      <MarkdownControl
        common={common}
        value={value}
        onChange={(next) => onChange(path, next)}
        rows={field.rows}
      />
    );
  } else if (type === "checkbox") {
    control = (
      <input
        {...common}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(path, event.target.checked)}
        className="size-5 accent-(--color-accent-fill)"
      />
    );
  } else if (type === "checkboxes") {
    return (
      <CheckboxesField
        field={field}
        value={value ?? []}
        onChange={(next) => onChange(path, next)}
        error={error}
        hint={hint}
      />
    );
  } else if (type === "select") {
    // A blank first option: "None" for an optional choice, or a
    // placeholder so a required one starts visibly unchosen.
    const emptyLabel = field.optional ? "None" : field.placeholder;
    control = (
      <select
        {...common}
        value={value ?? ""}
        onChange={(event) => onChange(path, event.target.value)}
        className={INPUT}
      >
        {emptyLabel ? <option value="">{emptyLabel}</option> : null}
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
    if (field.quickAdd === "organizations") {
      control = (
        <>
          {control}
          <QuickAddOrganization onCreated={(id) => onChange(path, id)} />
        </>
      );
    }
  } else if (["textarea", "lines", "paragraphs", "json"].includes(type)) {
    control = (
      <textarea
        {...common}
        rows={field.rows ?? (type === "json" ? 10 : 4)}
        value={value ?? ""}
        onChange={(event) => onChange(path, event.target.value)}
        className={cn(INPUT, type === "json" && "font-mono text-sm")}
        spellCheck={type !== "json"}
      />
    );
  } else {
    const listId = field.suggestions?.length ? `${id}-suggestions` : undefined;
    control = (
      <>
        <input
          {...common}
          type={type === "number" ? "number" : type}
          value={value ?? ""}
          onChange={(event) => onChange(path, event.target.value)}
          className={INPUT}
          list={listId}
        />
        {listId ? (
          <datalist id={listId}>
            {field.suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        ) : null}
      </>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-1.5",
        type === "checkbox" &&
          "flex flex-row-reverse items-center justify-end gap-3",
      )}
    >
      {/* An image field's control is an "Upload image" button that keeps
          its own name; the field label describes it instead. */}
      {type === "image" ? (
        <p id={`${id}-label`} className={LABEL}>
          {field.label}
          {optionalMark}
        </p>
      ) : (
        <label htmlFor={id} className={LABEL}>
          {field.label}
          {optionalMark}
        </label>
      )}
      {control}
      {hint && type !== "checkbox" ? (
        <p id={`${id}-hint`} className="text-xs text-(--color-text-muted)">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Read-only links to the items that point here (e.g. an organization's certifications). */
function RelatedField({ field }) {
  return (
    <section className="grid gap-1.5">
      <h2 className={LABEL}>{field.label}</h2>
      {field.items.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">{field.empty}</p>
      ) : (
        <ul className="grid gap-1">
          {field.items.map((item) => (
            <li key={item.to} className="text-sm">
              <Link
                to={item.to}
                className="font-medium text-(--color-text-primary) underline underline-offset-4"
              >
                {item.label}
              </Link>
              {item.detail ? (
                <span className="text-(--color-text-muted)">
                  {" "}
                  · {item.detail}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Several choices from a fixed list (projects, certifications), as
 * native checkboxes in a fieldset. The value is the array of chosen
 * option values.
 */
function CheckboxesField({ field, value, onChange, error, hint }) {
  const id = useId();
  function toggle(optionValue, checked) {
    onChange(
      checked
        ? [...value, optionValue]
        : value.filter((item) => item !== optionValue),
    );
  }
  return (
    <fieldset
      aria-describedby={
        [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
          .filter(Boolean)
          .join(" ") || undefined
      }
      className="grid gap-1.5"
    >
      <legend className={cn(LABEL, "mb-1.5")}>{field.label}</legend>
      {field.options.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">
          Nothing to choose yet.
        </p>
      ) : null}
      <div className="grid gap-x-4 sm:grid-cols-2">
        {field.options.map((option) => (
          <label
            key={option.value}
            className="flex min-h-11 items-center gap-3 text-[0.9375rem] text-(--color-text-primary)"
          >
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={(event) => toggle(option.value, event.target.checked)}
              className="size-5 shrink-0 accent-(--color-accent-fill)"
            />
            {option.label}
          </label>
        ))}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-(--color-text-muted)">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-(--color-danger)">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** A repeatable group of sub-fields (links, social profiles, highlights). */
function ObjectListField({ field, path, draft, errors, onChange, isNew }) {
  const items = getAt(draft, path) ?? [];
  const listError = errorFor(errors, path, false);
  const itemLabel = field.itemLabel ?? "item";

  function update(next) {
    onChange(path, next);
  }

  function move(index, offset) {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    update(next);
  }

  return (
    <fieldset className="grid gap-3 rounded-(--radius-md) border border-(--color-border) p-4">
      <legend className="px-1 text-sm font-semibold text-(--color-text-primary)">
        {field.label}
      </legend>
      {field.hint ? (
        <p className="text-xs text-(--color-text-muted)">{field.hint}</p>
      ) : null}
      {listError ? (
        <p className="text-sm text-(--color-danger)">{listError}</p>
      ) : null}
      {items.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">None yet.</p>
      ) : null}
      {items.map((item, index) => (
        <div
          key={field.fixed ? item.id : index}
          className="grid gap-3 rounded-(--radius-sm) bg-(--color-surface-raised) p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className={
                field.itemTitle
                  ? "font-semibold text-(--color-text-primary)"
                  : "mono-meta text-(--color-text-muted)"
              }
            >
              {field.itemTitle?.(item) ?? `${itemLabel} ${index + 1}`}
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                className={SMALL_BUTTON}
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${field.itemTitle?.(item) ?? `${itemLabel} ${index + 1}`} up`}
              >
                <ArrowUp size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={SMALL_BUTTON}
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`Move ${field.itemTitle?.(item) ?? `${itemLabel} ${index + 1}`} down`}
              >
                <ArrowDown size={14} aria-hidden="true" />
              </button>
              {field.fixed ? null : (
                <button
                  type="button"
                  className={SMALL_BUTTON}
                  onClick={() => update(items.filter((_, i) => i !== index))}
                  aria-label={`Remove ${itemLabel} ${index + 1}`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {field.fields
              .filter((sub) => !sub.showWhen || sub.showWhen(items[index]))
              .map((sub) => (
                <div key={sub.name} className={fieldSpan(sub)}>
                  <Field
                    field={sub}
                    path={`${path}.${index}.${sub.name}`}
                    draft={draft}
                    errors={errors}
                    onChange={onChange}
                    isNew={isNew}
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
      {field.fixed ? null : (
        <button
          type="button"
          className={cn(SMALL_BUTTON, "justify-self-start")}
          onClick={() =>
            update([...items, toDraft(field.newItem ?? {}, field.fields)])
          }
        >
          <Plus size={14} aria-hidden="true" />
          Add {itemLabel}
        </button>
      )}
    </fieldset>
  );
}

/**
 * Renders a list of field definitions against a draft.
 * @param {{
 *   fields: import("./draft").Field[],
 *   draft: Record<string, unknown>,
 *   errors: Record<string, string>,
 *   onChange: (path: string, value: unknown) => void,
 *   isNew?: boolean,
 * }} props
 */
export function FormFields({ fields, draft, errors, onChange, isNew = false }) {
  return (
    <div className="grid content-start gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className={fieldSpan(field)}>
          <Field
            field={field}
            path={field.name}
            draft={draft}
            errors={errors}
            onChange={onChange}
            isNew={isNew}
          />
        </div>
      ))}
    </div>
  );
}
