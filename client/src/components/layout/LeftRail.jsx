import { Link, NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV } from "../../config/navigation";
import { usePreferences } from "../../features/preferences/usePreferences";
import { ThemeToggleButton, SoundToggleButton } from "./PreferenceButtons";
import { BrandMark } from "./BrandMark";
import { AppearanceMenu } from "./AppearanceMenu";
import { cn } from "../../lib/cn";
import { profile } from "../../data/profile";
import { useIsHydrating, useNow } from "../../lib/hydration";
import { calendarDate } from "../../lib/dates";

const ACTIVE_LAYOUT_ID = "left-rail-active";

// Show the shortcut the visitor's platform actually uses (the palette
// accepts both Meta+K and Ctrl+K — see CommandPalette.jsx). Read after
// hydration: the prerendered page doesn't know the platform.
function useIsApplePlatform() {
  const hydrating = useIsHydrating();
  return (
    !hydrating &&
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  );
}

/** @param {{ item: { to: string, label: string, icon: import("react").ElementType, end?: boolean } }} props */
function RailLink({ item }) {
  const { play } = usePreferences();
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        onClick={() => play("tap")}
        title={item.label}
        className={({ isActive }) =>
          cn(
            "relative isolate flex min-h-12 items-center justify-center gap-3.5 rounded-(--radius-md) px-3.5 text-[1.0625rem] font-medium transition-colors duration-(--duration-quick) xl:justify-start",
            isActive
              ? "font-semibold text-(--color-text-primary)"
              : "text-(--color-text-secondary) hover:bg-(--color-surface-raised) hover:text-(--color-text-primary)",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive ? (
              <motion.span
                layoutId={ACTIVE_LAYOUT_ID}
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-(--radius-md) bg-(--color-surface-soft)"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            ) : null}
            <Icon size={22} aria-hidden="true" />
            <span className="sr-only xl:not-sr-only">{item.label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

/**
 * Desktop/tablet navigation rail. Icons + labels at xl, icons only (with
 * screen-reader labels and tooltips) between md and xl, hidden on phones
 * where BottomNav takes over.
 */
export function LeftRail() {
  const isApple = useIsApplePlatform();
  const now = useNow();
  function openPalette() {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  }

  return (
    <aside
      aria-label="Sidebar"
      className="sticky top-0 z-(--z-rail) hidden h-dvh flex-col gap-2 px-3 py-5 md:flex xl:px-0 xl:pr-5"
    >
      <Link
        to="/"
        className="mb-5 flex items-center justify-center gap-3 rounded-(--radius-md) px-1 xl:justify-start xl:px-3"
        aria-label={`${profile.name} — profile`}
      >
        <BrandMark />
        <span className="hidden text-[1.375rem] font-bold tracking-[-0.03em] xl:inline">
          Jahid<span className="text-(--color-text-muted)"> Hasan</span>
        </span>
      </Link>

      <nav aria-label="Main">
        <ul className="grid gap-1">
          {PRIMARY_NAV.map((item) => (
            <RailLink key={item.to} item={item} />
          ))}
        </ul>
        <hr className="mx-3.5 my-3 border-(--color-border)" />
        <ul className="grid gap-1">
          {SECONDARY_NAV.map((item) => (
            <RailLink key={item.to} item={item} />
          ))}
        </ul>
      </nav>

      <button
        type="button"
        onClick={openPalette}
        aria-label="Search — open command palette"
        title="Search"
        className="mt-3 flex min-h-11 items-center justify-center gap-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) px-3.5 text-sm text-(--color-text-muted) transition-colors hover:border-(--color-border-strong) hover:text-(--color-text-primary) xl:justify-start"
      >
        <Search size={18} aria-hidden="true" />
        <span className="hidden flex-1 text-left xl:inline">Search</span>
        <kbd className="mono-meta hidden rounded-md border border-(--color-border) px-1.5 py-0.5 xl:inline">
          {isApple ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <div className="mt-auto grid gap-4 xl:px-3">
        <div className="flex flex-col items-center gap-2 xl:flex-row">
          <ThemeToggleButton />
          <SoundToggleButton />
          <AppearanceMenu />
        </div>
        <p className="hidden text-sm text-(--color-text-muted) xl:block">
          © {calendarDate(now).year} {profile.name}
        </p>
      </div>
    </aside>
  );
}
