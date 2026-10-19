import { Suspense, useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, LayoutDashboard, LogOut } from "lucide-react";
import { usePageMeta } from "../../hooks/usePageMeta";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { GitHubIcon } from "../../components/icons/BrandIcons";
import { BrandMark } from "../../components/layout/BrandMark";
import { cn } from "../../lib/cn";
import {
  ADMIN_LOGIN_URL,
  SIGN_IN_ERRORS,
  fetchAdminContent,
  getAdminSession,
  signOutAdmin,
} from "../../features/admin/admin-api";
import { AdminContext } from "../../features/admin/admin-context";
import { ADMIN_GROUPS } from "../../features/admin/admin-collections";
import { needsMigration, sectionCount } from "../../features/admin/attention";
import { PublishButton } from "../../features/admin/PublishButton";

function CenteredCard({ children }) {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center bg-(--color-canvas) px-4 py-10"
    >
      <div className="w-full max-w-sm rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-7 text-center">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <h1 className="mt-4 text-[1.5rem] font-bold tracking-[-0.02em] text-(--color-text-primary)">
          Site admin
        </h1>
        {children}
        <ButtonLink
          to="/"
          variant="ghost"
          size="sm"
          leadingIcon={<ArrowLeft size={15} />}
          className="mt-4"
        >
          Back to the site
        </ButtonLink>
      </div>
    </main>
  );
}

function navClass({ isActive }) {
  return cn(
    "flex min-h-11 shrink-0 items-center gap-2.5 rounded-(--radius-md) px-3 text-[0.9375rem] font-medium whitespace-nowrap transition-colors",
    isActive
      ? "bg-(--color-surface-soft) text-(--color-text-primary)"
      : "text-(--color-text-secondary) hover:bg-(--color-surface-raised) hover:text-(--color-text-primary)",
  );
}

/** A sidebar entry: icon, label, and how many items the section holds. */
function SectionLink({ section, content }) {
  const Icon = section.icon;
  const count = sectionCount(section.path, content);
  const warnings =
    section.path === "repositories"
      ? (content.repositories?.warnings.length ?? 0)
      : 0;
  return (
    <NavLink to={`/admin/${section.path}`} className={navClass}>
      <Icon size={17} aria-hidden="true" className="shrink-0" />
      <span className="flex-1">{section.label}</span>
      {warnings > 0 ? (
        <span
          className="size-2 rounded-full bg-(--color-danger)"
          title="Needs attention"
        >
          <span className="sr-only">, needs attention</span>
        </span>
      ) : null}
      {count !== null ? (
        <span className="text-xs tabular-nums text-(--color-text-muted)">
          <span className="sr-only">, </span>
          {count}
        </span>
      ) : null}
    </NavLink>
  );
}

/**
 * Admin shell: checks the session, shows GitHub sign-in when signed out,
 * and once signed in loads all content and renders the editors. Lives
 * outside the public app shell and is never indexed.
 */
export function AdminLayout() {
  usePageMeta({
    title: "Admin — Jahid Hasan",
    description: "Site administration.",
    robots: "noindex, nofollow",
  });
  const [searchParams] = useSearchParams();
  const errorMessage = SIGN_IN_ERRORS[searchParams.get("error")];
  // "loading" | "signed-out" | "signed-in" | "unavailable"
  const [status, setStatus] = useState("loading");
  const [admin, setAdmin] = useState(null);
  const [content, setContent] = useState(null);
  const [contentError, setContentError] = useState("");

  const reload = useCallback(async () => {
    try {
      setContent(await fetchAdminContent());
      setContentError("");
    } catch (error) {
      setContentError(error.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then((user) => {
        if (!active) return;
        setAdmin(user);
        setStatus(user ? "signed-in" : "signed-out");
        if (user) reload();
      })
      .catch(() => {
        if (active) setStatus("unavailable");
      });
    return () => {
      active = false;
    };
  }, [reload]);

  async function handleSignOut() {
    try {
      await signOutAdmin();
      setAdmin(null);
      setContent(null);
      setStatus("signed-out");
    } catch {
      setStatus("unavailable");
    }
  }

  if (status !== "signed-in") {
    return (
      <CenteredCard>
        <div role="status" aria-live="polite" className="mt-2">
          {status === "loading" ? (
            <p className="text-(--color-text-muted)">Checking your session…</p>
          ) : null}
          {status === "unavailable" ? (
            <p className="text-(--color-danger)">
              The admin service isn&apos;t reachable right now.
            </p>
          ) : null}
          {status === "signed-out" && errorMessage ? (
            <p className="text-(--color-danger)">{errorMessage}</p>
          ) : null}
        </div>
        {status === "signed-out" ? (
          <>
            <p className="mt-2 text-[0.9375rem] text-(--color-text-secondary)">
              Sign in with the site owner&apos;s GitHub account to manage
              content.
            </p>
            <ButtonLink
              href={ADMIN_LOGIN_URL}
              leadingIcon={<GitHubIcon size={17} />}
              className="mt-6 w-full justify-center"
            >
              Sign in with GitHub
            </ButtonLink>
          </>
        ) : null}
      </CenteredCard>
    );
  }

  return (
    <div className="min-h-dvh bg-(--color-canvas)">
      <header className="sticky top-0 z-(--z-header) flex items-center justify-between gap-3 border-b border-(--color-border) bg-(--color-canvas)/90 px-4 py-3 backdrop-blur sm:px-6">
        <Link to="/admin" className="flex items-center gap-3">
          <BrandMark />
          <span className="font-bold tracking-[-0.02em] text-(--color-text-primary)">
            Admin
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <img
            src={admin.avatarUrl}
            alt=""
            width={32}
            height={32}
            className="hidden size-8 rounded-full border border-(--color-border) sm:block"
          />
          <span className="hidden text-sm text-(--color-text-secondary) sm:inline">
            @{admin.login}
          </span>
          {content ? (
            <PublishButton
              publishing={content.publishing}
              onPublished={reload}
            />
          ) : null}
          <ButtonLink
            href="/"
            target="_blank"
            rel="noreferrer"
            variant="ghost"
            size="sm"
            trailingIcon={<ExternalLink size={14} />}
            className="hidden sm:inline-flex"
          >
            View site
          </ButtonLink>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSignOut}
            leadingIcon={<LogOut size={15} />}
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav
          aria-label="Admin sections"
          className="min-w-0 md:sticky md:top-20 md:self-start"
        >
          <ul className="flex gap-1 overflow-x-auto pb-1 md:grid md:gap-4 md:overflow-visible">
            <li>
              <NavLink to="/admin" end className={navClass}>
                <LayoutDashboard size={17} aria-hidden="true" />
                Overview
              </NavLink>
            </li>
            {content
              ? ADMIN_GROUPS.map((group) => (
                  <li
                    key={group.label}
                    className="flex shrink-0 gap-1 md:block"
                  >
                    <p
                      id={`admin-group-${group.label}`}
                      className="mono-meta mb-1 hidden px-3 text-(--color-text-muted) md:block"
                    >
                      {group.label}
                    </p>
                    <ul
                      aria-labelledby={`admin-group-${group.label}`}
                      className="flex gap-1 md:grid"
                    >
                      {group.sections.map((section) => (
                        <li key={section.path}>
                          <SectionLink section={section} content={content} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              : null}
          </ul>
        </nav>

        <main id="main-content" className="min-w-0">
          {contentError ? (
            <p
              role="alert"
              className="mb-4 rounded-(--radius-md) border border-(--color-danger)/40 p-3 text-sm text-(--color-danger)"
            >
              Couldn&apos;t load content: {contentError}{" "}
              <button
                type="button"
                onClick={reload}
                className="font-semibold underline"
              >
                Retry
              </button>
            </p>
          ) : null}
          {content && needsMigration(content) ? (
            <p
              role="alert"
              className="mb-4 rounded-(--radius-md) border border-(--color-warning)/50 bg-(--color-warning)/10 p-3 text-sm text-(--color-text-primary)"
            >
              The database is still in the old format, so Experience, Education,
              and Certifications can&apos;t be edited yet. Run{" "}
              <code>npm run migrate -w server</code> once, then reload.
            </p>
          ) : null}
          {content ? (
            <AdminContext.Provider value={{ admin, content, reload }}>
              <Suspense fallback={<p role="status">Loading…</p>}>
                <Outlet />
              </Suspense>
            </AdminContext.Provider>
          ) : (
            !contentError && (
              <p role="status" className="text-(--color-text-muted)">
                Loading content…
              </p>
            )
          )}
        </main>
      </div>
    </div>
  );
}
