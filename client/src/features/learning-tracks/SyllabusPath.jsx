import { useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatStudyDay, trackProgress } from "./journal";

const MARKERS = {
  done: "border-(--color-accent-primary) bg-(--color-accent-primary) text-(--color-canvas)",
  doing:
    "border-(--color-accent-primary) bg-(--color-accent-primary-soft) ring-4 ring-(--color-accent-primary)/20",
  todo: "border-(--color-border-strong) bg-(--color-surface)",
};

/**
 * A track's topics as a path: done ones filled, the current one marked
 * "you are here", the rest outlined. Collapsed behind a disclosure button
 * so long syllabi don't bury the page.
 * @param {{ syllabus: Array<{ title: string, status: "todo" | "doing" | "done", date?: string }> }} props
 */
export function SyllabusPath({ syllabus }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const progress = trackProgress({ syllabus });

  return (
    <div className="mt-4 border-t border-(--color-border) pt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-(--radius-sm) text-left text-[0.9375rem] font-medium text-(--color-text-primary)"
      >
        <span>
          Topics{" "}
          <span className="mono-meta text-(--color-text-muted)">
            · {progress.done} of {progress.total} done
          </span>
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            "text-(--color-text-secondary) transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>
      <ol id={listId} hidden={!open} className="mt-2 grid">
        {syllabus.map((topic, index) => (
          <li
            key={`${topic.title}-${index}`}
            className="relative grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 pb-3 last:pb-0"
          >
            {index < syllabus.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-5 bottom-0 left-[0.5625rem] w-0.5",
                  topic.status === "done"
                    ? "bg-(--color-accent-primary)"
                    : "bg-(--color-border)",
                )}
              />
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "relative mt-0.5 grid size-5 place-items-center rounded-full border-2",
                MARKERS[topic.status],
              )}
            >
              {topic.status === "done" ? (
                <Check size={12} strokeWidth={3} />
              ) : null}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[0.9375rem]",
                  topic.status === "todo"
                    ? "text-(--color-text-secondary)"
                    : "text-(--color-text-primary)",
                )}
              >
                {topic.title}
                <span className="sr-only">
                  {` (${{ done: "done", doing: "studying now", todo: "not started" }[topic.status]})`}
                </span>
              </p>
              {topic.status === "doing" ? (
                <p
                  aria-hidden="true"
                  className="mono-meta text-(--color-accent-primary)"
                >
                  ▸ You are here
                </p>
              ) : null}
              {topic.date ? (
                <p className="mono-meta text-(--color-text-muted)">
                  {formatStudyDay(topic.date)}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
