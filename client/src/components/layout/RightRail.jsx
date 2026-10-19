import { Link } from "react-router-dom";
import { ArrowUpRight, GitBranch } from "lucide-react";
import { ButtonLink } from "../ui/ButtonLink";
import { GitHubIcon } from "../icons/BrandIcons";
import { SocialIcon } from "../icons/SocialIcon";
import { profile, socialProfiles } from "../../data/profile";
import { githubSnapshot } from "../../data/github";
import { formatRelativeDate } from "../../lib/relativeTime";
import { navSetting, siteSettings } from "../../data/settings";

const FOOTER_LINKS = [
  { to: "/resume", label: "Resume" },
  { to: "/writing", label: "Writing" },
]
  .map((link) => ({ ...link, ...navSetting(link.to, link.label) }))
  .filter((link) => link.visible);

function OpenToCard() {
  return (
    <section
      aria-labelledby="rail-open-to"
      className="glow-surface rounded-(--radius-xl) border border-(--color-accent-primary)/20 p-5"
    >
      <h2
        id="rail-open-to"
        className="flex items-center gap-2.5 text-[1.0625rem] font-semibold text-(--color-text-primary)"
      >
        <span className="status-dot" aria-hidden="true" />
        Open to new roles
      </h2>
      <p className="mt-2.5 text-[0.9375rem] text-(--color-text-secondary)">
        {profile.availabilityDetail}
      </p>
      <ButtonLink to="/contact" size="sm" className="mt-4">
        Let&apos;s talk
      </ButtonLink>
    </section>
  );
}

function RecentGitHubCard() {
  return (
    <section
      aria-labelledby="rail-github"
      className="rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-5"
    >
      <h2
        id="rail-github"
        className="flex items-center gap-2.5 text-[1.0625rem] font-semibold text-(--color-text-primary)"
      >
        <GitHubIcon size={17} />
        Recently on GitHub
      </h2>
      <ul className="mt-4 grid gap-3.5">
        {githubSnapshot.recentRepos.map((repo) => (
          <li
            key={repo.name}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-full border border-(--color-border) bg-(--color-surface-raised) text-(--color-text-secondary)"
            >
              <GitBranch size={16} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.9375rem] font-semibold text-(--color-text-primary)">
                {repo.name}
              </p>
              <p className="truncate text-[0.8125rem] text-(--color-text-muted)">
                {[repo.language, formatRelativeDate(repo.pushedAt)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <ButtonLink
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              size="sm"
              aria-label={`View ${repo.name} on GitHub`}
            >
              View
            </ButtonLink>
          </li>
        ))}
      </ul>
      <a
        href={githubSnapshot.repositoriesUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex min-h-11 items-center justify-between text-[0.9375rem] font-semibold text-(--color-accent-primary) hover:underline underline-offset-4"
      >
        See all {githubSnapshot.publicRepos} repositories
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </section>
  );
}

function FindMeOn() {
  return (
    <section aria-labelledby="rail-find-me">
      <h2
        id="rail-find-me"
        className="flex items-center gap-2.5 px-1 text-[1.0625rem] font-semibold text-(--color-text-primary)"
      >
        <span className="status-dot" aria-hidden="true" />
        Find me on
      </h2>
      <ul className="mt-3 grid">
        {socialProfiles.map((social) => (
          <li key={social.id}>
            <a
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className="grid grid-cols-[2.75rem_minmax(0,1fr)_1.25rem] items-center gap-3.5 rounded-(--radius-md) px-1 py-2 transition-colors hover:bg-(--color-surface-raised)"
            >
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-full border border-(--color-border) bg-(--color-surface-raised) text-(--color-text-primary)"
              >
                <SocialIcon id={social.id} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-(--color-text-primary)">
                  {social.label}
                </span>
                <span className="block truncate text-sm text-(--color-text-muted)">
                  {social.handle}
                </span>
              </span>
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="text-(--color-text-muted)"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Right-hand column of cards, shown from the xl breakpoint up. */
export function RightRail() {
  return (
    <aside aria-label="Highlights" className="hidden py-5 pl-6 xl:block">
      <div className="sticky top-5 grid gap-5">
        {siteSettings.openToWorkBadge ? <OpenToCard /> : null}
        {siteSettings.showGithubActivity &&
        githubSnapshot.recentRepos.length > 0 ? (
          <RecentGitHubCard />
        ) : null}
        <FindMeOn />
        {FOOTER_LINKS.length > 0 ? (
          <p className="px-1 text-xs text-(--color-text-muted)">
            {FOOTER_LINKS.map((link, index) => (
              <span key={link.to}>
                {index > 0 ? " · " : null}
                <Link
                  to={link.to}
                  className="hover:underline underline-offset-4"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
