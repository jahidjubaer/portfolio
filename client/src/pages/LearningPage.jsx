import {
  BookOpen,
  CalendarDays,
  Code2,
  Crosshair,
  Route as RouteIcon,
  Sprout,
} from "lucide-react";
import { ProblemSolvingStats } from "../features/coding/ProblemSolvingStats";
import { hasCodingStats } from "../data/coding";
import { usePageMeta } from "../hooks/usePageMeta";
import { PAGE_META } from "../routes/route-meta";
import { PageHeader, PageHeaderTitle } from "../components/layout/PageHeader";
import { TextLink } from "../components/ui/TextLink";
import { ProfileSection } from "../features/profile/ProfileSection";
import { LearningTrackCard } from "../features/learning-tracks/LearningTrackCard";
import { CertificationList } from "../features/credentials/CertificationList";
import { NowStudying } from "../features/learning-tracks/NowStudying";
import { StudyJournal } from "../features/learning-tracks/StudyJournal";
import {
  lastStudiedByTrack,
  nowStudyingTracks,
} from "../features/learning-tracks/journal";
import {
  LEARNING_STATUSES,
  learningMethod,
  learningTracks,
  studyLog,
} from "../data/learning";
import { certifications } from "../data/certifications";

const trackGroups = LEARNING_STATUSES.map((status) => ({
  ...status,
  tracks: learningTracks.filter((track) => track.status === status.id),
})).filter((group) => group.tracks.length > 0);

const lastStudied = lastStudiedByTrack(studyLog);
const nowStudying = nowStudyingTracks(learningTracks, lastStudied);

// Until tracks are written up in the admin, the courses in progress are
// the honest answer to "what is he learning now?".
const inProgress = certifications.filter(
  (item) => item.status === "in-progress",
);

/** The "How I learn" steps, numbered, with arrows between them on wide screens. */
function MethodSteps() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {learningMethod.steps.map((step, index) => (
        <li
          key={step.title}
          className="rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) p-4"
        >
          <p className="mono-meta text-(--color-accent-primary)">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-1 font-semibold text-(--color-text-primary)">
            {step.title}
          </h3>
          <p className="mt-1 text-[0.9375rem] text-(--color-text-secondary)">
            {step.description}
          </p>
        </li>
      ))}
    </ol>
  );
}

/** How Jahid learns, and what he is learning, with the proof linked. */
export function LearningPage() {
  usePageMeta(PAGE_META["/learning"]);

  return (
    <>
      <PageHeader>
        <PageHeaderTitle as="h1">Learning</PageHeaderTitle>
      </PageHeader>

      {nowStudying.length ? (
        <ProfileSection id="now" icon={Crosshair} title="Now studying">
          <NowStudying tracks={nowStudying} lastStudied={lastStudied} />
        </ProfileSection>
      ) : null}

      <ProfileSection id="how-i-learn" icon={RouteIcon} title="How I learn">
        {learningMethod.intro ? (
          <p className="mb-5 max-w-[46em] text-base text-(--color-text-secondary)">
            {learningMethod.intro}
          </p>
        ) : null}
        <MethodSteps />
      </ProfileSection>

      {trackGroups.map((group) => (
        <ProfileSection
          key={group.id}
          id={group.id}
          icon={group.id === "learning" ? Sprout : BookOpen}
          title={group.label}
        >
          <ul className="grid gap-4">
            {group.tracks.map((track) => (
              <li key={track.id}>
                <LearningTrackCard track={track} />
              </li>
            ))}
          </ul>
        </ProfileSection>
      ))}

      {studyLog.length ? (
        <ProfileSection id="study-log" icon={CalendarDays} title="Study log">
          <StudyJournal entries={studyLog} />
        </ProfileSection>
      ) : null}

      {hasCodingStats ? (
        <ProfileSection
          id="problem-solving"
          icon={Code2}
          title="Problem solving"
        >
          <ProblemSolvingStats />
        </ProfileSection>
      ) : null}

      {trackGroups.length === 0 && inProgress.length > 0 ? (
        <ProfileSection id="in-progress" icon={Sprout} title="In progress">
          <CertificationList items={inProgress} />
        </ProfileSection>
      ) : null}

      <p className="px-4 py-8 text-[0.9375rem] text-(--color-text-secondary) sm:px-7">
        Completed courses and certificates are on{" "}
        <TextLink to="/credentials">Education &amp; Certifications</TextLink>,
        and the notes I write along the way are under{" "}
        <TextLink to="/writing">Writing</TextLink>.
      </p>
    </>
  );
}
