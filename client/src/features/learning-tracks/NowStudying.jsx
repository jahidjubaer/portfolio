import { formatRelativeDate } from "../../lib/relativeTime";
import { useNow } from "../../lib/hydration";
import { ProgressRing } from "./ProgressRing";
import { currentTopic, trackProgress } from "./journal";

/**
 * The current topic of each track being learned, its progress, and when
 * it was last studied.
 * @param {{
 *   tracks: import("../../data/learning").LearningTrack[],
 *   lastStudied: Map<string, string>,
 * }} props
 */
export function NowStudying({ tracks, lastStudied }) {
  const now = useNow();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {tracks.map((track) => {
        const progress = trackProgress(track);
        const topic = currentTopic(track);
        const last = lastStudied.get(track.id);
        return (
          <li
            key={track.id}
            className="flex items-start gap-3.5 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4"
          >
            {progress ? (
              <ProgressRing done={progress.done} total={progress.total} />
            ) : null}
            <div className="min-w-0">
              <p className="font-semibold text-(--color-text-primary)">
                {track.title}
              </p>
              {topic ? (
                <p className="mt-0.5 text-[0.9375rem] text-(--color-text-secondary)">
                  <span className="mono-meta text-(--color-accent-primary)">
                    Now ·{" "}
                  </span>
                  {topic.title}
                </p>
              ) : null}
              {track.goal ? (
                <p className="mt-0.5 text-[0.9375rem] text-(--color-text-secondary)">
                  Goal: {track.goal}
                </p>
              ) : null}
              {last ? (
                <p className="mono-meta mt-1 text-(--color-text-muted)">
                  Last studied {formatRelativeDate(last, now)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
