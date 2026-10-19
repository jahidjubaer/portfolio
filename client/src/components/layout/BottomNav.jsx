import { NavLink } from "react-router-dom";
import { PRIMARY_NAV, SECONDARY_NAV } from "../../config/navigation";
import { usePreferences } from "../../features/preferences/usePreferences";
import { cn } from "../../lib/cn";

// Five slots fit a phone comfortably: the four primary routes plus Writing.
// Resume stays reachable from the profile page and the command palette.
const writing = SECONDARY_NAV.find((item) => item.to === "/learning");
const BOTTOM_NAV = [...PRIMARY_NAV.slice(0, 3), writing, PRIMARY_NAV[3]];

/** Fixed bottom tab bar for phones (hidden from md up). */
export function BottomNav() {
  const { play } = usePreferences();
  return (
    <nav
      aria-label="Main"
      className="header-blur fixed inset-x-0 bottom-0 z-(--z-header) border-t border-(--color-border) bg-(--color-canvas)/90 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5 px-2 pt-1.5">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={() => play("tap")}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-13 flex-col items-center justify-center gap-1 rounded-(--radius-sm) text-[0.6875rem] font-semibold transition-colors",
                    isActive
                      ? "text-(--color-accent-primary)"
                      : "text-(--color-text-muted)",
                  )
                }
              >
                <Icon size={21} aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
