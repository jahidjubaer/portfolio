import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../../features/admin/admin-context";
import { LISTS } from "../../features/admin/admin-collections";
import { createListItem, updateListItem } from "../../features/admin/admin-api";
import { EditorForm } from "../../features/admin/form/EditorForm";
import { AiDraftPanel } from "../../features/admin/AiDraftPanel";
import { PREVIEWS } from "../../features/admin/previews";
import { addRepoLink } from "../../features/admin/repo-links";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { ExternalLink } from "lucide-react";
import { AdminPageHeader } from "./AdminPageHeader";

/**
 * Add or edit one list item. `/admin/<name>/new` creates; any other key
 * edits the matching item.
 * @param {{ name: keyof typeof LISTS }} props
 */
export function AdminItemPage({ name }) {
  const { key } = useParams();
  const navigate = useNavigate();
  const { state: routeState } = useLocation();
  const { content, reload } = useAdmin();
  const config = LISTS[name];
  const isNew = key === undefined;
  // Some new items get a generated id; create it once, not on every render.
  const [newItem] = useState(() =>
    typeof config.newItem === "function"
      ? config.newItem(routeState)
      : config.newItem,
  );
  const item = isNew
    ? newItem
    : content[name]?.find((entry) => entry[config.keyField] === key);
  const fields =
    typeof config.fields === "function"
      ? config.fields(content, item)
      : config.fields;
  const backTo = `/admin/${name}`;
  // "Add to existing project" on the GitHub repos page: the repo is added
  // as an unsaved change, for Jahid to check and save.
  const addRepo = !isNew && name === "projects" ? routeState?.addRepo : null;
  const startValue =
    addRepo && item
      ? {
          ...item,
          links: addRepoLink(
            item.links,
            addRepo,
            content.repositories?.username ?? "",
          ),
        }
      : undefined;

  const siteUrl = !isNew && item ? config.viewOnSite?.(item) : null;

  if (!item) {
    return (
      <AdminPageHeader
        title="Not found"
        description={`No ${config.itemLabel} called “${key}”.`}
        backTo={backTo}
        backLabel={config.label}
      />
    );
  }

  async function handleSave(value) {
    if (isNew) {
      await createListItem(name, value);
    } else {
      await updateListItem(name, key, value);
    }
    await reload();
  }

  function handleSaved(value) {
    if (isNew)
      navigate(`${backTo}/${encodeURIComponent(value[config.keyField])}`, {
        replace: true,
      });
  }

  return (
    <>
      <AdminPageHeader
        title={
          isNew ? `New ${config.itemLabel}` : config.titleOf(item, content)
        }
        description={
          isNew
            ? config.prefilledNote?.(routeState)
            : addRepo &&
              `Added ${addRepo.name} under GitHub repositories. Pick its role, then save.`
        }
        backTo={backTo}
        backLabel={config.label}
        actions={
          siteUrl ? (
            <ButtonLink
              href={siteUrl}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              size="sm"
              trailingIcon={<ExternalLink size={14} />}
            >
              View on site
              <span className="sr-only"> (published version, new tab)</span>
            </ButtonLink>
          ) : null
        }
      />
      <EditorForm
        key={key ?? "new"}
        fields={fields}
        schema={config.schema}
        value={item}
        startValue={startValue}
        isNew={isNew}
        onSave={handleSave}
        onSaved={handleSaved}
        normalize={config.normalize}
        // The server assigns `order`; give validation a placeholder.
        prepareForValidation={(value) => ({ ...value, order: item.order ?? 0 })}
        submitLabel={isNew ? `Add ${config.itemLabel}` : "Save changes"}
        preview={
          PREVIEWS[name] ? (value) => PREVIEWS[name](value, content) : undefined
        }
        assist={
          config.aiDraft
            ? ({ values, apply }) => (
                <AiDraftPanel
                  kind={config.aiDraft}
                  content={content}
                  values={values}
                  apply={apply}
                />
              )
            : undefined
        }
      />
    </>
  );
}
