import { Link } from "react-router-dom";
import { SocialIcon } from "../icons/SocialIcon";
import { profile, socialProfiles } from "../../data/profile";

/**
 * Footer at the end of the center column for screens without the right
 * rail (below xl), so social links and secondary routes stay reachable.
 */
export function ShellFooter() {
  return (
    <footer className="border-t border-(--color-border) px-4 py-8 sm:px-7 xl:hidden">
      <ul className="flex flex-wrap gap-2">
        {socialProfiles.map((social) => (
          <li key={social.id}>
            <a
              href={social.url}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              title={social.label}
              className="grid size-11 place-items-center rounded-full border border-(--color-border) bg-(--color-surface-raised) text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
            >
              <SocialIcon id={social.id} />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-(--color-text-muted)">
        © {new Date().getFullYear()} {profile.name} ·{" "}
        <Link to="/resume" className="underline-offset-4 hover:underline">
          Resume
        </Link>
      </p>
    </footer>
  );
}
