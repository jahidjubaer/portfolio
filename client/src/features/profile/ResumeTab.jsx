import {
  Award,
  CircleUserRound,
  Download,
  FileText,
  GraduationCap,
  Layers,
  Target,
} from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { CertificationsSection } from "./CertificationsSection";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { cn } from "../../lib/cn";
import { profile } from "../../data/profile";
import { experienceGroups } from "../../data/experience";
import { educationEntries } from "../../data/education";
import { ExperienceList } from "../experience/ExperienceList";
import { EducationList } from "../credentials/EducationList";
import { ShowAllLink } from "./ShowAllLink";
import { capabilityGroups } from "../../data/capabilities";
import { githubSnapshot } from "../../data/github";

// The first two target roles are the primary positioning (CLAUDE.md);
// they get the accent treatment, the management tracks stay neutral.
const PRIMARY_ROLE_COUNT = 2;

// The profile previews education like LinkedIn; the rest is on /credentials.
const EDUCATION_PREVIEW = 2;

const STATS = [
  { value: "250+", label: "problems solved in C++", accent: true },
  {
    value: `${profile.problemSolving.platforms.split(/, | and /).length} judges`,
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

/** Resume-style overview: the default profile tab. */
export function ResumeTab() {
  return (
    <>
      <ProfileSection id="about" icon={CircleUserRound} title="About">
        <div className="grid max-w-[46em] gap-3.5 text-base text-(--color-text-secondary)">
          {profile.about.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </ProfileSection>

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

      {experienceGroups.length > 0 ? (
        <ProfileSection
          id="experience"
          icon={Award}
          title="Experience & leadership"
        >
          <ExperienceList groups={experienceGroups} />
        </ProfileSection>
      ) : null}

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

      <CertificationsSection />

      <ProfileSection id="skills" icon={Layers} title="Skills">
        <div className="grid gap-5">
          {capabilityGroups.map((group) => {
            const learning = group.id === "currently-expanding";
            return (
              <div key={group.id}>
                <h3 className="mb-2.5 text-sm font-semibold text-(--color-text-secondary)">
                  {group.title}
                  {learning ? (
                    <span className="ml-2 font-normal text-(--color-text-muted)">
                      learning, not expert yet
                    </span>
                  ) : null}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className={cn(
                        "rounded-full border bg-(--color-surface-raised) px-3 py-1 text-sm font-medium",
                        learning
                          ? "border-dashed border-(--color-border-strong) text-(--color-text-secondary)"
                          : "border-(--color-border) text-(--color-text-primary)",
                      )}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </ProfileSection>

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
    </>
  );
}
