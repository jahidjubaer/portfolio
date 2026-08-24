import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";
import { Tag } from "../../components/ui/Tag";
import { cn } from "../../lib/cn";
import { timelineEvents, TIMELINE_CATEGORY_LABELS } from "../../data/timeline";

/**
 * Restrained chronological rail of verified milestones — a single left-side
 * rail on every viewport (see client/src/data/timeline.js for the source
 * facts). Education milestones get slightly stronger typographic weight
 * than leadership/community entries; nothing here is a giant card, and
 * nothing implies a completion percentage.
 */
export function Timeline() {
  if (timelineEvents.length === 0) return null;

  return (
    <StaggerGroup
      as="ol"
      className="relative border-l border-(--color-border) pl-6"
    >
      {timelineEvents.map((event) => {
        const isEducation = event.category === "education";

        return (
          <StaggerItem
            key={event.id}
            as="li"
            className="relative pb-8 last:pb-0"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute -left-[1.9rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-(--color-canvas)",
                isEducation
                  ? "bg-(--color-accent-primary)"
                  : "bg-(--color-text-muted)",
              )}
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <time className="mono-meta text-(--color-accent-primary)">
                {event.date}
              </time>
              <Tag>
                {TIMELINE_CATEGORY_LABELS[event.category] ?? event.category}
              </Tag>
            </div>
            <h3
              className={cn(
                "mt-2 text-(--color-text-primary)",
                isEducation ? "heading-md" : "text-sm font-semibold",
              )}
            >
              {event.title}
            </h3>
            <p className="body-sm mt-1 text-(--color-text-secondary)">
              {event.organization}
            </p>
            <p className="body-sm mt-1 max-w-prose text-(--color-text-muted)">
              {event.description}
            </p>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
