import {
  Award,
  Camera,
  CircleUserRound,
  Download,
  FileText,
  GraduationCap,
  HeartHandshake,
  Layers,
  Target,
  Users,
} from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { CertificationsSection } from "./CertificationsSection";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { cn } from "../../lib/cn";
import { profile } from "../../data/profile";
import { timelineEvents } from "../../data/timeline";
import { capabilityGroups } from "../../data/capabilities";
import { githubSnapshot } from "../../data/github";

// The first two target roles are the primary positioning (CLAUDE.md);
// they get the accent treatment, the management tracks stay neutral.
const PRIMARY_ROLE_COUNT = 2;

const experience = timelineEvents
  .filter((event) => event.category !== "education")
  .slice()
  .reverse();

function experienceIcon(event) {
  if (event.category === "community") return HeartHandshake;
  if (/photograph/i.test(event.organization)) return Camera;
  return Users;
}

function TimelineItem({ icon: Icon, title, date, organization, children }) {
  return (
    <li className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 pb-6 last:pb-0">
      <span
        aria-hidden="true"
        className="relative z-[1] grid size-11 place-items-center rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) text-(--color-text-secondary)"
      >
        <Icon size={19} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h3 className="text-base font-semibold text-(--color-text-primary)">
            {title}
          </h3>
          <span className="mono-meta tabular-nums text-(--color-text-muted)">
            {date}
          </span>
        </div>
        <p className="text-[0.9375rem] text-(--color-text-secondary)">
          {organization}
        </p>
        {children}
      </div>
    </li>
  );
}

function Timeline({ children }) {
  return (
    <ol className="relative before:absolute before:bottom-2 before:left-[1.375rem] before:top-2 before:w-px before:bg-(--color-border)">
      {children}
    </ol>
  );
}

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

      <ProfileSection
        id="experience"
        icon={Award}
        title="Experience & leadership"
      >
        <Timeline>
          {experience.map((event) => (
            <TimelineItem
              key={event.id}
              icon={experienceIcon(event)}
              title={event.title}
              date={event.date}
              organization={event.organization}
            >
              <p className="mt-1.5 text-[0.9375rem] text-(--color-text-secondary)">
                {event.description}
              </p>
            </TimelineItem>
          ))}
        </Timeline>
      </ProfileSection>

      <ProfileSection id="education" icon={GraduationCap} title="Education">
        <Timeline>
          <TimelineItem
            icon={GraduationCap}
            title={profile.education.degree}
            date={profile.education.graduation}
            organization={profile.education.university}
          />
        </Timeline>
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
