import {
  Award,
  CircleUserRound,
  Download,
  FileText,
  GraduationCap,
  Target,
} from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { CertificationsSection } from "./CertificationsSection";
import { SkillsSection } from "./SkillsSection";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { cn } from "../../lib/cn";
import { profile } from "../../data/profile";
import { experienceGroups } from "../../data/experience";
import { educationEntries } from "../../data/education";
import { ExperienceList } from "../experience/ExperienceList";
import { EducationList } from "../credentials/EducationList";
import { ShowAllLink } from "./ShowAllLink";
import { githubSnapshot } from "../../data/github";
import { codingStats, dimikSolved, distinctSolved } from "../../data/coding";
import { siteSettings } from "../../data/settings";

// The first two target roles are the primary positioning (CLAUDE.md);
// they get the accent treatment, the management tracks stay neutral.
const PRIMARY_ROLE_COUNT = 2;

// The profile previews education like LinkedIn; the rest is on /credentials.
const EDUCATION_PREVIEW = 2;

// Synced judges (plus Dimik OJ when its count is entered); before the
// first sync, the platforms typed on the profile.
const judgeCount = codingStats.judges.length
  ? codingStats.judges.length + (dimikSolved === null ? 0 : 1)
  : profile.problemSolving.platforms.split(/, | and /).length;
const solvedTotal = distinctSolved();

const STATS = [
  // Computed by the sync, overlaps counted once (docs/11 D2).
  solvedTotal !== null
    ? {
        value: String(solvedTotal),
        label: `distinct problems solved in ${profile.problemSolving.primaryLanguage}`,
        accent: true,
      }
    : null,
  {
    value: `${judgeCount} judges`,
    label: profile.problemSolving.platforms,
  },
  // Shown once a GitHub sync has counted the repositories.
  githubSnapshot.publicRepos > 0
    ? {
        value: String(githubSnapshot.publicRepos),
        label: "public repositories",
      }
    : null,
].filter(Boolean);

function AboutSection() {
  return (
    <ProfileSection id="about" icon={CircleUserRound} title="About">
      <div className="grid max-w-[46em] gap-3.5 text-base text-(--color-text-secondary)">
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </ProfileSection>
  );
}

function OpenToSection() {
  return (
    <ProfileSection id="open-to" icon={Target} title="Open to">
      <ul className="flex flex-wrap gap-2">
        {profile.targetRoles.map((role, index) => (
          <li
            key={role}
            className={cn(
              "rounded-(--radius-sm) border px-3.5 py-1.5 text-[0.9375rem] font-semibold",
              index < PRIMARY_ROLE_COUNT
                ? "border-(--color-accent-primary)/35 bg-(--color-accent-primary-soft) text-(--color-accent-primary)"
                : "border-(--color-border) bg-(--color-surface-raised) text-(--color-text-primary)",
            )}
          >
            {role}
          </li>
        ))}
      </ul>
    </ProfileSection>
  );
}
function ExperienceSection() {
  return experienceGroups.length > 0 ? (
    <ProfileSection
      id="experience"
      icon={Award}
      title="Experience & leadership"
    >
      <ExperienceList groups={experienceGroups} />
    </ProfileSection>
  ) : null;
}

function EducationSection() {
  return (
    <ProfileSection id="education" icon={GraduationCap} title="Education">
      <EducationList entries={educationEntries.slice(0, EDUCATION_PREVIEW)} />
      <ShowAllLink
        total={educationEntries.length}
        shown={EDUCATION_PREVIEW}
        noun="education entries"
        to="/credentials#education"
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {STATS.map((stat) => (
          <li
            key={stat.label}
            className="rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) p-4"
          >
            <p
              className={cn(
                "text-[1.375rem] font-bold tracking-[-0.02em] tabular-nums",
                stat.accent
                  ? "text-(--color-accent-primary)"
                  : "text-(--color-text-primary)",
              )}
            >
              {stat.value}
            </p>
            <p className="text-sm text-(--color-text-muted)">{stat.label}</p>
          </li>
        ))}
      </ul>
    </ProfileSection>
  );
}

function ResumeSection() {
  return (
    <ProfileSection id="resume" icon={FileText} title="Resume">
      <div className="flex flex-wrap items-center gap-3">
        {profile.resume.available ? (
          <ButtonLink
            href={profile.resume.url}
            download={profile.resume.filename}
            leadingIcon={<Download size={16} />}
          >
            Download resume (PDF)
          </ButtonLink>
        ) : null}
        <ButtonLink to="/resume" variant="secondary">
          View resume page
        </ButtonLink>
        {profile.resume.available ? (
          <span className="text-sm text-(--color-text-muted)">
            {profile.resume.updatedLabel}
          </span>
        ) : null}
      </div>
    </ProfileSection>
  );
}

// Section ids match PROFILE_SECTIONS in server/src/schemas/settings-defaults.js.
const SECTIONS = {
  about: AboutSection,
  "open-to": OpenToSection,
  experience: ExperienceSection,
  education: EducationSection,
  certifications: CertificationsSection,
  skills: SkillsSection,
  resume: ResumeSection,
};

/**
 * Resume-style overview: the default profile tab. Which sections show,
 * and in what order, is set under Site settings in the admin.
 */
export function ResumeTab() {
  return siteSettings.profileSections
    .filter((section) => section.visible)
    .map((section) => {
      const Section = SECTIONS[section.id];
      return <Section key={section.id} />;
    });
}
