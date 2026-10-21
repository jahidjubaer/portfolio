import { useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Ellipsis } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV } from "../../config/navigation";
import { usePreferences } from "../../features/preferences/usePreferences";
import { MoreSheet } from "./MoreSheet";
import { cn } from "../../lib/cn";

// Four tabs plus "More": the pages a phone visitor needs most, then a sheet
// with every other page. Pages hidden in Site settings drop out of both.
const TAB_ROUTES = ["/", "/work", "/writing", "/contact"];
const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];
const TABS = TAB_ROUTES.map((to) =>
  ALL_NAV.find((item) => item.to === to),
).filter(Boolean);
const MORE_ITEMS = ALL_NAV.filter((item) => !TABS.includes(item));

const TAB =
  "flex min-h-13 w-full flex-col items-center justify-center gap-1 rounded-(--radius-sm) text-[0.6875rem] font-semibold transition-colors";

function isWithin(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Fixed bottom tab bar for phones (hidden from md up). */
export function BottomNav() {
  const { play } = usePreferences();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const moreActive = MORE_ITEMS.some((item) => isWithin(pathname, item.to));
  const columns = TABS.length + (MORE_ITEMS.length ? 1 : 0);

  return (
    <>
      <nav
        aria-label="Main"
        className="header-blur fixed inset-x-0 bottom-0 z-(--z-header) border-t border-(--color-border) bg-(--color-canvas)/90 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul
          className="grid px-2 pt-1.5"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => play("tap")}
                  className={({ isActive }) =>
                    cn(
                      TAB,
                      isActive
                        ? "text-(--color-accent-primary)"
                        : "text-(--color-text-secondary)",
                    )
                  }
                >
                  <Icon size={21} aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
          {MORE_ITEMS.length ? (
            <li>
              <button
                ref={moreRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={moreOpen}
                onClick={() => {
                  play("tap");
                  setMoreOpen(true);
                }}
                className={cn(
                  TAB,
                  moreActive || moreOpen
                    ? "text-(--color-accent-primary)"
                    : "text-(--color-text-secondary)",
                )}
              >
                <Ellipsis size={21} aria-hidden="true" />
                More
              </button>
            </li>
          ) : null}
        </ul>
      </nav>
      {moreOpen ? (
        <MoreSheet
          items={MORE_ITEMS}
          onClose={() => setMoreOpen(false)}
          triggerRef={moreRef}
        />
      ) : null}
    </>
  );
}
