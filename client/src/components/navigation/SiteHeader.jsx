import { useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Container } from "../ui/Container";
import { IconButton } from "../ui/IconButton";
import { MobileMenu } from "./MobileMenu";
import { cn } from "../../lib/cn";
import { useScrolled } from "../../hooks/useScrolled";
import { profile } from "../../data/profile";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/beyond", label: "Beyond" },
  { to: "/contact", label: "Contact" },
  { to: "/resume", label: "Résumé" },
];

const MOBILE_MENU_ID = "mobile-nav";
const NAV_ACTIVE_LAYOUT_ID = "site-header-active-pill";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();
  const menuButtonRef = useRef(null);
  const wasOpenRef = useRef(false);

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

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 sm:flex"
          >
            {NAV_ITEMS.map((item) => (
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
          </nav>

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
