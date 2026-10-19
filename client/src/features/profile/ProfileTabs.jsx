import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { usePreferences } from "../preferences/usePreferences";
import { cn } from "../../lib/cn";

/**
 * Accessible tabs (WAI-ARIA tabs pattern: roving tabindex, arrow/Home/End
 * keys). The selected tab lives in the URL (`?tab=work`) so it survives a
 * refresh and can be shared; the default tab keeps the URL clean.
 * @param {{
 *   tabs: Array<{ id: string, label: string, panel: import("react").ReactNode }>,
 *   label: string,
 * }} props
 */
export function ProfileTabs({ tabs, label }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { play } = usePreferences();
  const tabRefs = useRef([]);
  const requested = searchParams.get("tab");
  const selectedId = tabs.some((tab) => tab.id === requested)
    ? requested
    : tabs[0].id;

  function select(id) {
    if (id === selectedId) return;
    play("tap");
    setSearchParams(id === tabs[0].id ? {} : { tab: id }, {
      replace: true,
      preventScrollReset: true,
    });
  }

  function handleKeyDown(event, index) {
    const last = tabs.length - 1;
    let next = null;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    select(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="mt-7 flex justify-center gap-10 border-b border-(--color-border)"
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === selectedId;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative min-h-12 px-1 text-[0.9375rem] font-bold uppercase tracking-[0.06em] transition-colors",
                selected
                  ? "text-(--color-accent-primary)"
                  : "text-(--color-text-secondary) hover:text-(--color-text-primary)",
              )}
            >
              {tab.label}
              {selected ? (
                <motion.span
                  layoutId="profile-tab-underline"
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-(--color-accent-primary)"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== selectedId}
          tabIndex={0}
          className="outline-none"
        >
          {tab.id === selectedId ? tab.panel : null}
        </div>
      ))}
    </div>
  );
}
