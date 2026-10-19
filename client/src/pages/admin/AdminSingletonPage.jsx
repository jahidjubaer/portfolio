import { useAdmin } from "../../features/admin/admin-context";
import { SINGLETONS } from "../../features/admin/admin-collections";
import { saveSingleton } from "../../features/admin/admin-api";
import { EditorForm } from "../../features/admin/form/EditorForm";
import { AdminPageHeader } from "./AdminPageHeader";

/** @param {{ name: "profile" | "beyond" }} props */
export function AdminSingletonPage({ name }) {
  const { content, reload } = useAdmin();
  const config = SINGLETONS[name];

  async function handleSave(value) {
    await saveSingleton(name, value);
    await reload();
  }

  return (
    <>
      <AdminPageHeader title={config.label} description={config.description} />
      {content[name] ? (
        <EditorForm
          key={name}
          fields={config.fields}
          schema={config.schema}
          value={content[name]}
          onSave={handleSave}
        />
      ) : (
        <p className="text-(--color-text-secondary)">
          Nothing saved yet. Run the seed script to import the current content.
        </p>
      )}
    </>
  );
}
