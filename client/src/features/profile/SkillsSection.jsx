import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Layers } from "lucide-react";
import { cn } from "../../lib/cn";
import { capabilityGroups } from "../../data/capabilities";
import { projects } from "../../data/projects";
import { DURATIONS, EASE_STANDARD } from "../motion/motion-config";
import { ProfileSection } from "./ProfileSection";
import { projectsUsing } from "./skill-projects";

const CHIP =
  "inline-flex h-9 items-center rounded-full border bg-(--color-surface-raised) px-3 text-sm font-medium";
// Chips stay 36px tall; this stretches a pressable one's hit area to 44px.
const HIT_AREA =
  "relative after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']";

/**
 * Skills grouped as in the admin. A skill that a public project lists in
 * its stack is a toggle: pressing it shows the projects that use it, as
 * links. Skills no project uses stay plain text, so nothing suggests
 * evidence that isn't there. One skill is open at a time; Escape closes
 * it and returns focus to the skill.
 */
export function SkillsSection() {
  const baseId = useId();
  const [openSkill, setOpenSkill] = useState(null);
  const buttons = useRef(new Map());

  function toggle(key) {
    setOpenSkill((current) => (current === key ? null : key));
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape" || !openSkill) return;
    const button = buttons.current.get(openSkill);
    setOpenSkill(null);
    button?.focus();
  }

  return (
    <ProfileSection id="skills" icon={Layers} title="Skills">
      {/* Escape bubbles up from a skill or a project link inside. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="grid gap-5" onKeyDown={handleKeyDown}>
        {capabilityGroups.map((group) => {
          const learning = group.id === "currently-expanding";
          const openInGroup = group.items.find(
            (item) => `${group.id}:${item}` === openSkill,
          );
          const used = openInGroup ? projectsUsing(openInGroup, projects) : [];
          const panelId = `${baseId}-${group.id}`;
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
                {group.items.map((item) => {
                  const key = `${group.id}:${item}`;
                  const count = projectsUsing(item, projects).length;
                  const tone = learning
                    ? "border-dashed border-(--color-border-strong) text-(--color-text-secondary)"
                    : "border-(--color-border) text-(--color-text-primary)";
                  if (count === 0) {
                    return (
                      <li key={item} className={cn(CHIP, tone)}>
                        {item}
                      </li>
                    );
                  }
                  const open = openSkill === key;
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        ref={(node) => {
                          if (node) buttons.current.set(key, node);
                          else buttons.current.delete(key);
                        }}
                        aria-label={`${item}, used in ${count} ${
                          count === 1 ? "project" : "projects"
                        }`}
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => toggle(key)}
                        className={cn(
                          CHIP,
                          tone,
                          HIT_AREA,
                          "gap-2 transition-colors hover:border-(--color-accent-primary)",
                          open &&
                            "border-solid border-(--color-accent-primary) bg-(--color-accent-primary-soft) text-(--color-accent-primary)",
                        )}
                      >
                        {item}
                        <span
                          aria-hidden="true"
                          className="font-mono text-[0.6875rem] text-(--color-text-muted)"
                        >
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div id={panelId}>
                <AnimatePresence initial={false}>
                  {openInGroup ? (
                    <motion.div
                      key={openInGroup}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: DURATIONS.standard,
                        ease: EASE_STANDARD,
                      }}
                      className="mt-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-3"
                    >
                      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-(--color-text-muted)">
                        {openInGroup} is used in
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        {used.map((project) => (
                          <li key={project.slug}>
                            <Link
                              to={`/work/${project.slug}`}
                              className="inline-flex min-h-11 items-center text-sm font-semibold text-(--color-accent-primary) underline-offset-4 hover:underline"
                            >
                              {project.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </ProfileSection>
  );
}
