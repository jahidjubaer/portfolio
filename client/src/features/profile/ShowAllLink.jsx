import { ArrowRight } from "lucide-react";
import { TextLink } from "../../components/ui/TextLink";

/**
 * "Show all 5 certifications →" under a profile preview, only when the
 * preview hides some.
 * @param {{ total: number, shown: number, noun: string, to: string }} props
 */
export function ShowAllLink({ total, shown, noun, to }) {
  if (total <= shown) return null;
  return (
    <p className="mt-5">
      <TextLink to={to} className="inline-flex min-h-11 items-center gap-1.5">
        Show all {total} {noun}
        <ArrowRight size={15} aria-hidden="true" />
      </TextLink>
    </p>
  );
}
