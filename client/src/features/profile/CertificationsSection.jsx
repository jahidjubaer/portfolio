import { BadgeCheck } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { ShowAllLink } from "./ShowAllLink";
import { CertificationList } from "../credentials/CertificationList";
import { certifications } from "../../data/certifications";

const FALLBACK_PREVIEW = 2;

// The ones marked "Show on the profile" in the admin, or else the latest
// two. Newest-first order is kept either way.
const featured = certifications.filter((item) => item.featured);
const preview =
  featured.length > 0 ? featured : certifications.slice(0, FALLBACK_PREVIEW);

/**
 * A short preview of licenses & certifications, as LinkedIn shows on a
 * profile; the full list is on /credentials. Renders nothing while empty.
 */
export function CertificationsSection() {
  if (certifications.length === 0) return null;
  return (
    <ProfileSection
      id="certifications"
      icon={BadgeCheck}
      title="Licenses & certifications"
    >
      <CertificationList items={preview} />
      <ShowAllLink
        total={certifications.length}
        shown={preview.length}
        noun="licenses & certifications"
        to="/credentials#certifications"
      />
    </ProfileSection>
  );
}
