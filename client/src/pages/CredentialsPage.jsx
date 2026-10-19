import { useState } from "react";
import { BadgeCheck, GraduationCap } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { ProfileSection } from "../features/profile/ProfileSection";
import { EducationList } from "../features/credentials/EducationList";
import { CertificationList } from "../features/credentials/CertificationList";
import { educationEntries } from "../data/education";
import { CERTIFICATION_KINDS, certifications } from "../data/certifications";
import { cn } from "../lib/cn";

const presentKinds = CERTIFICATION_KINDS.filter((kind) =>
  certifications.some((item) => item.kind === kind.id),
);
// Filtering only helps once both certifications and courses exist.
const FILTERS =
  presentKinds.length > 1 ? [{ id: "all", label: "All" }, ...presentKinds] : [];

/**
 * Chips that filter certifications by kind. Active state is never
 * colour-only: it also carries aria-pressed, weight, and an underline.
 * @param {{ value: string, onChange: (id: string) => void }} props
 */
function KindFilter({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Filter by type"
      className="mb-5 flex flex-wrap gap-2"
    >
      {FILTERS.map((filter) => {
        const active = value === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.id)}
            className={cn(
              "min-touch-target rounded-(--radius-pill) border px-4 py-2 text-sm transition-colors",
              active
                ? "border-(--color-accent-primary) bg-(--color-accent-primary-soft) font-semibold text-(--color-text-primary) underline underline-offset-4"
                : "border-(--color-border) text-(--color-text-secondary) hover:text-(--color-text-primary)",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

/** Education and licenses & certifications on one page, as on LinkedIn. */
export function CredentialsPage() {
  const [kind, setKind] = useState("all");
  usePageMeta(PAGE_META["/credentials"]);

  const visible =
    kind === "all"
      ? certifications
      : certifications.filter((item) => item.kind === kind);

  return (
    <>
      <PageHeader>
        <PageHeaderTitle as="h1">
          Education &amp; Certifications
        </PageHeaderTitle>
      </PageHeader>

      {educationEntries.length > 0 ? (
        <ProfileSection id="education" icon={GraduationCap} title="Education">
          <EducationList entries={educationEntries} />
        </ProfileSection>
      ) : null}

      {certifications.length > 0 ? (
        <ProfileSection
          id="certifications"
          icon={BadgeCheck}
          title="Licenses & certifications"
        >
          {FILTERS.length > 0 ? (
            <KindFilter value={kind} onChange={setKind} />
          ) : null}
          <CertificationList items={visible} />
        </ProfileSection>
      ) : null}
    </>
  );
}
