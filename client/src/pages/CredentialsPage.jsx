import { BadgeCheck, BookOpen, GraduationCap } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { ProfileSection } from "../features/profile/ProfileSection";
import { EducationList } from "../features/credentials/EducationList";
import { CertificationList } from "../features/credentials/CertificationList";
import { educationEntries } from "../data/education";
import { certifications, groupCertifications } from "../data/certifications";

const ICONS = { certification: BadgeCheck, course: BookOpen };
// Anchors: "certifications" is what the admin's "View on site" opens.
const ANCHORS = { certification: "certifications", course: "courses" };

const sections = groupCertifications(certifications);

/**
 * Education, then certifications and courses as separate sections, each
 * grouped into professional and leadership & community.
 */
export function CredentialsPage() {
  usePageMeta(PAGE_META["/credentials"]);

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

      {sections.map((section) => (
        <ProfileSection
          key={section.id}
          id={ANCHORS[section.id]}
          icon={ICONS[section.id]}
          title={section.label}
        >
          <div className="grid gap-8">
            {section.groups.map((group) => (
              <div key={group.id}>
                <h3 className="mono-meta mb-4 text-(--color-text-muted) uppercase">
                  {group.label}
                </h3>
                <CertificationList items={group.items} headingLevel="h4" />
              </div>
            ))}
          </div>
        </ProfileSection>
      ))}
    </>
  );
}
