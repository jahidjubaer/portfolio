import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { Container } from "../ui/Container";
import { IconButton } from "../ui/IconButton";
import { ButtonLink } from "../ui/ButtonLink";
import { MobileMenu } from "./MobileMenu";
import { cn } from "../../lib/cn";
import { useScrolled } from "../../hooks/useScrolled";
import { profile } from "../../data/profile";

// Desktop nav is grouped by audience priority: recruiter-critical routes
// stay visible, the rest sit behind a "More" disclosure. The mobile menu
// deliberately keeps the full flat list (NAV_ITEMS).
const NAV_PRIMARY = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
];

const NAV_SECONDARY = [
  { to: "/learning", label: "Learning" },
  { to: "/beyond", label: "Beyond" },
  { to: "/resume", label: "Résumé" },
];

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/learning", label: "Learning" },
  { to: "/beyond", label: "Beyond" },
  { to: "/contact", label: "Contact" },
  { to: "/resume", label: "Résumé" },
];

const MORE_MENU_ID = "site-header-more-menu";

const MOBILE_MENU_ID = "mobile-nav";
const NAV_ACTIVE_LAYOUT_ID = "site-header-active-pill";

// Show the shortcut hint the user's platform actually uses (the palette
// itself accepts both Meta+K and Ctrl+K — see CommandPalette.jsx).
const IS_APPLE_PLATFORM =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const scrolled = useScrolled();
  const menuButtonRef = useRef(null);
  const wasOpenRef = useRef(false);
  const moreRef = useRef(null);
  const moreButtonRef = useRef(null);
  const { pathname } = useLocation();

  const isSecondaryActive = NAV_SECONDARY.some(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );

  // The "More" disclosure closes on navigation, on Escape (returning focus
  // to its trigger), and on any interaction outside it.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      setMoreOpen(false);
      moreButtonRef.current?.focus();
    }
    function handlePointerDown(event) {
      if (!moreRef.current?.contains(event.target)) setMoreOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [moreOpen]);

  // Return focus to the trigger button whenever the menu closes without
  // the user having clicked the trigger itself (e.g. Escape, or a nav
  // link inside the menu navigating away).
  useEffect(() => {
    if (wasOpenRef.current && !menuOpen) {
      const active = document.activeElement;
      const insideMenu = active?.closest(`#${MOBILE_MENU_ID}`);
      if (insideMenu || active === document.body) {
        menuButtonRef.current?.focus();
      }
    }
    wasOpenRef.current = menuOpen;
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-(--z-header) border-b transition-colors duration-(--duration-standard)",
          scrolled
            ? "header-blur border-(--color-border) bg-(--color-canvas)/85"
            : "border-transparent bg-(--color-canvas)",
        )}
      >
        <Container
          as="div"
          className="flex h-(--header-height) items-center justify-between"
        >
          <Link
            to="/"
            className="font-mono text-lg font-bold text-(--color-text-primary)"
            aria-label={`${profile.name} — home`}
          >
            {profile.monogram}
          </Link>

          <div className="flex items-center gap-2">
            <nav
              aria-label="Primary"
              className="hidden items-center gap-1 sm:flex"
            >
              {NAV_PRIMARY.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className="relative rounded-(--radius-pill) px-3 py-2 text-sm font-medium"
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <motion.span
                          layoutId={NAV_ACTIVE_LAYOUT_ID}
                          className="absolute inset-0 rounded-(--radius-pill) bg-(--color-accent-primary-soft)"
                          transition={{
                            duration: 0.28,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      ) : null}
                      <span
                        className={cn(
                          "relative z-10 transition-colors duration-(--duration-quick)",
                          isActive
                            ? "text-(--color-accent-primary)"
                            : "text-(--color-text-secondary) hover:text-(--color-text-primary)",
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}

              {/* Secondary routes behind a disclosure (APG disclosure
                  navigation pattern — no menu roles needed). */}
              <div ref={moreRef} className="relative">
                <button
                  ref={moreButtonRef}
                  type="button"
                  aria-expanded={moreOpen}
                  aria-controls={MORE_MENU_ID}
                  onClick={() => setMoreOpen((current) => !current)}
                  className={cn(
                    "flex items-center gap-1 rounded-(--radius-pill) px-3 py-2 text-sm font-medium transition-colors duration-(--duration-quick)",
                    isSecondaryActive
                      ? "text-(--color-accent-primary)"
                      : "text-(--color-text-secondary) hover:text-(--color-text-primary)",
                  )}
                >
                  More
                  <ChevronDown
                    aria-hidden="true"
                    size={14}
                    className={cn(
                      "transition-transform duration-(--duration-quick)",
                      moreOpen && "rotate-180",
                    )}
                  />
                </button>
                {moreOpen ? (
                  <ul
                    id={MORE_MENU_ID}
                    className="absolute right-0 top-full z-(--z-header) mt-2 w-44 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) p-1.5 shadow-(--shadow-md)"
                  >
                    {NAV_SECONDARY.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              "block rounded-(--radius-sm) px-3 py-2.5 text-sm font-medium transition-colors duration-(--duration-quick)",
                              isActive
                                ? "bg-(--color-accent-primary-soft) text-(--color-accent-primary)"
                                : "text-(--color-text-secondary) hover:bg-(--color-surface-soft) hover:text-(--color-text-primary)",
                            )
                          }
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </nav>

            {/* Command Palette Trigger Button */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="hidden min-h-11 items-center gap-2 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft)/70 px-3 text-xs text-(--color-text-muted) transition-colors hover:border-(--color-accent-primary) hover:text-(--color-text-primary) sm:inline-flex"
              aria-label="Search — open command palette"
              aria-keyshortcuts="Meta+K Control+K"
            >
              <Search aria-hidden="true" size={14} />
              <span>Search</span>
              <kbd className="rounded border border-(--color-border) bg-(--color-canvas) px-1.5 py-0.5 font-mono text-[10px]">
                {IS_APPLE_PLATFORM ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>

            <ButtonLink
              to="/contact"
              variant="primary"
              size="sm"
              className="hidden md:inline-flex"
            >
              Contact
            </ButtonLink>

            <IconButton
              ref={menuButtonRef}
              variant="secondary"
              label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls={MOBILE_MENU_ID}
              className="sm:hidden"
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </IconButton>
          </div>
        </Container>
      </header>

      <MobileMenu
        id={MOBILE_MENU_ID}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={NAV_ITEMS}
      />
    </>
  );
}
