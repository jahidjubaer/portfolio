import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { MobileMenu } from "./MobileMenu";
import { profile } from "../../data/profile";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/beyond", label: "Beyond" },
  { to: "/contact", label: "Contact" },
  { to: "/resume", label: "Résumé" },
];

const DESKTOP_LINK_CLASSES = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "text-(--color-accent)"
      : "text-(--color-text-muted) hover:text-(--color-text)"
  }`;

const MOBILE_MENU_ID = "mobile-nav";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-background)/95 backdrop-blur-sm">
        <Container className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="font-mono text-lg font-bold text-(--color-text)"
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
                className={DESKTOP_LINK_CLASSES}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-(--color-border) text-(--color-text) sm:hidden"
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>
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
