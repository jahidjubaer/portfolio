import { Container } from "../ui/Container";
import { profile } from "../../data/profile";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--color-border) py-10">
      <Container className="flex flex-col gap-4 text-sm text-(--color-text-muted) sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-(--color-text)">{profile.name}</p>
          <p>{profile.title}</p>
          <p>{profile.location}</p>
        </div>

        <nav aria-label="Social" className="flex flex-wrap gap-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--color-accent)"
          >
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover:text-(--color-accent)"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="hover:text-(--color-accent)"
          >
            Email
          </a>
        </nav>

        <p>
          &copy; {year} {profile.name}
        </p>
      </Container>
    </footer>
  );
}
