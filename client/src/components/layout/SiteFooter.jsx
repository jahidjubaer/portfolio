import { ArrowUpRight, Mail } from "lucide-react";
import { Container } from "../ui/Container";
import { Divider } from "../ui/Divider";
import { profile } from "../../data/profile";

/*
 * lucide-react (current major) no longer ships brand/logo icons like
 * Github/Linkedin — only generic glyphs remain. ArrowUpRight paired with
 * the visible label communicates "external profile" without relying on a
 * brand mark.
 */
const SOCIAL_LINKS = [
  { label: "GitHub", href: profile.github, icon: ArrowUpRight },
  { label: "LinkedIn", href: profile.linkedin, icon: ArrowUpRight },
  { label: "Email", href: `mailto:${profile.email}`, icon: Mail },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto">
      <Divider />
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-sm font-semibold text-(--color-text-primary)">
            {profile.monogram} {profile.name}
          </p>
          <p className="body-sm mt-1 text-(--color-text-secondary)">
            {profile.title}
          </p>
          <p className="mono-meta mt-3 text-(--color-text-muted)">
            {profile.location}
          </p>
        </div>

        <nav aria-label="Social" className="flex gap-3">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
              aria-label={label}
              className="inline-flex min-touch-target items-center justify-center rounded-(--radius-md) border border-(--color-border) text-(--color-text-secondary) transition-colors duration-(--duration-quick) hover:border-(--color-accent-primary) hover:text-(--color-accent-primary)"
            >
              <Icon aria-hidden="true" size={18} />
            </a>
          ))}
        </nav>

        <p className="mono-meta text-(--color-text-muted)">
          &copy; {year} {profile.name}
        </p>
      </Container>
    </footer>
  );
}
