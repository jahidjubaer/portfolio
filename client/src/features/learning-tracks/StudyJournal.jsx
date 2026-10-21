import { useState } from "react";
import { ArrowUpRight, Clock, X } from "lucide-react";
import { Markdown } from "../../components/ui/Markdown";
import { useNow } from "../../lib/hydration";
import { cn } from "../../lib/cn";
import {
  buildStudyCalendar,
  formatMinutes,
  formatStudyDay,
  groupByDay,
  studyLevel,
} from "./journal";

const LEVELS = [
  "bg-(--color-surface-raised)",
  "bg-(--color-accent-primary)/25",
  "bg-(--color-accent-primary)/45",
  "bg-(--color-accent-primary)/70",
  "bg-(--color-accent-primary)",
];

const CHIP =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors";

// Days shown before "Show older days".
const PAGE_DAYS = 10;

/**
 * One square per day for the last 26 weeks. The squares are a picture:
 * the summary above says the same in words, and the log below lists every
 * day, so clicking a square (to show only that day) is a mouse shortcut.
 */
function StudyCalendar({ calendar, selectedDay, onSelectDay }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div
        aria-hidden="true"
        className="grid w-max grid-flow-col grid-rows-7 gap-[3px]"
      >
        {calendar.columns.flat().map((day) => {
          const level = studyLevel(day);
          const className = cn(
            "size-[11px] rounded-[2px] sm:size-[13px]",
            day.future ? "bg-transparent" : LEVELS[level],
            day.date === selectedDay &&
              "outline-2 outline-offset-1 outline-(--color-text-primary)",
          );
          return level > 0 ? (
            <button
              key={day.date}
              type="button"
              tabIndex={-1}
              title={`${formatStudyDay(day.date)}: ${day.count} ${day.count === 1 ? "entry" : "entries"}`}
              onClick={() => onSelectDay(day.date)}
              className={cn(className, "cursor-pointer")}
            />
          ) : (
            <span key={day.date} className={className} />
          );
        })}
      </div>
      <div
        aria-hidden="true"
        className="mono-meta mt-2 flex w-full max-w-[26rem] items-center justify-between gap-3 text-(--color-text-muted)"
      >
        <span>{formatStudyDay(calendar.from).slice(5)}</span>
        <span className="flex items-center gap-1">
          Less
          {LEVELS.map((level) => (
            <span
              key={level}
              className={cn("size-[11px] rounded-[2px]", level)}
            />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

/** One study session: track, topic, notes, time, and links. */
function StudyEntry({ entry }) {
  return (
    <article className="rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-4">
      <p className="mono-meta flex flex-wrap items-center gap-x-3 gap-y-1 text-(--color-text-muted)">
        <span className="text-(--color-accent-primary)">
          {entry.trackTitle}
        </span>
        {entry.minutes ? (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {formatMinutes(entry.minutes)}
          </span>
        ) : null}
      </p>
      {entry.topic ? (
        <p className="mt-1.5 font-semibold text-(--color-text-primary)">
          {entry.topic}
        </p>
      ) : null}
      <Markdown baseLevel={4} className="mt-1.5 text-[0.9375rem]">
        {entry.body}
      </Markdown>
      {entry.links.length ? (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.9375rem]">
          {entry.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-(--color-text-primary) underline decoration-(--color-border-strong) underline-offset-4 hover:decoration-(--color-accent-primary)"
              >
                {link.label}
                <ArrowUpRight
                  size={13}
                  aria-hidden="true"
                  className="ml-0.5 inline-block align-[-0.1em] opacity-60"
                />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

/**
 * The learning journal on /learning: a 26-week study calendar, then the
 * log, newest day first, filterable by track or by a clicked day.
 * @param {{ entries: import("../../data/learning").StudyLogEntry[] }} props
 */
export function StudyJournal({ entries }) {
  const now = useNow();
  const [trackId, setTrackId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [pages, setPages] = useState(1);
  const calendar = buildStudyCalendar(entries, now);

  const tracks = [
    ...new Map(
      entries.map((entry) => [entry.trackId, entry.trackTitle]),
    ).entries(),
  ];
  const filtered = entries.filter(
    (entry) =>
      (!trackId || entry.trackId === trackId) &&
      (!selectedDay || entry.date === selectedDay),
  );
  const days = groupByDay(filtered);
  const shown = days.slice(0, pages * PAGE_DAYS);

  function chooseTrack(id) {
    setTrackId(id);
    setPages(1);
  }

  function selectDay(date) {
    setSelectedDay((current) => (current === date ? null : date));
    setPages(1);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <p className="text-[0.9375rem] text-(--color-text-secondary)">
          <span className="font-semibold text-(--color-text-primary)">
            {calendar.studyDays} study{" "}
            {calendar.studyDays === 1 ? "day" : "days"}
          </span>
          {calendar.minutes
            ? `, ${formatMinutes(calendar.minutes)} logged,`
            : ""}{" "}
          in the last 26 weeks.
        </p>
        <StudyCalendar
          calendar={calendar}
          selectedDay={selectedDay}
          onSelectDay={selectDay}
        />
      </div>

      {tracks.length > 1 ? (
        <div
          role="group"
          aria-label="Filter by track"
          className="flex flex-wrap gap-2"
        >
          {[[null, "All tracks"], ...tracks].map(([id, title]) => (
            <button
              key={id ?? "all"}
              type="button"
              aria-pressed={trackId === id}
              onClick={() => chooseTrack(id)}
              className={cn(
                CHIP,
                trackId === id
                  ? "border-(--color-accent-primary) bg-(--color-accent-primary-soft) text-(--color-text-primary)"
                  : "border-(--color-border) text-(--color-text-secondary) hover:border-(--color-border-strong) hover:text-(--color-text-primary)",
              )}
            >
              {title}
            </button>
          ))}
        </div>
      ) : null}

      <div aria-live="polite">
        {selectedDay ? (
          <p className="mb-3 flex flex-wrap items-center gap-2 text-[0.9375rem] text-(--color-text-secondary)">
            Showing {formatStudyDay(selectedDay)}.
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className={cn(
                CHIP,
                "border-(--color-border) text-(--color-text-primary) hover:border-(--color-border-strong)",
              )}
            >
              <X size={14} aria-hidden="true" />
              Show all days
            </button>
          </p>
        ) : null}
        {days.length === 0 ? (
          <p className="text-[0.9375rem] text-(--color-text-secondary)">
            Nothing logged for this filter.
          </p>
        ) : null}
      </div>

      <ol className="grid gap-6">
        {shown.map((day) => (
          <li key={day.date}>
            <h3 className="mono-meta mb-2 text-(--color-text-secondary)">
              <time dateTime={day.date}>{formatStudyDay(day.date)}</time>
            </h3>
            <ul className="grid gap-2.5">
              {day.entries.map((entry) => (
                <li key={entry.id}>
                  <StudyEntry entry={entry} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {days.length > shown.length ? (
        <button
          type="button"
          onClick={() => setPages((value) => value + 1)}
          className={cn(
            CHIP,
            "justify-self-start border-(--color-border) text-(--color-text-primary) hover:border-(--color-border-strong)",
          )}
        >
          Show older days
        </button>
      ) : null}
    </div>
  );
}
