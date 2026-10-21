import { cn } from "../../lib/cn";
import { Sparkles } from "lucide-react";
import { AppearanceMenu } from "./AppearanceMenu";
import { AmbienceToggleButton } from "./PreferenceButtons";
import { IconButton } from "../ui/IconButton";
import { openAsk } from "../../features/ask/ask-events";

/**
 * Sticky, blurred header at the top of the center column. `children` is
 * the left side (a page title or the profile identity); `actions` sits on
 * the right. On phones the left rail is gone, so "Ask about Jahid", the
 * season sounds, and the appearance menu (theme, sound, accent, font) move
 * in here.
 * @param {{
 *   children: import("react").ReactNode,
 *   actions?: import("react").ReactNode,
 *   className?: string,
 * }} props
 */
export function PageHeader({ children, actions, className }) {
  return (
    <header
      className={cn(
        "header-blur sticky top-0 z-(--z-header) flex min-h-(--header-height) items-center justify-between gap-3 border-b border-(--color-border) bg-(--color-canvas)/85 px-4 py-3 sm:px-7",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">{children}</div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <IconButton
          label="Ask about Jahid"
          onClick={openAsk}
          className="md:hidden"
        >
          <Sparkles
            size={18}
            aria-hidden="true"
            className="text-(--color-accent-primary)"
          />
        </IconButton>
        {/* On the narrowest phones it lives in the appearance menu. */}
        <AmbienceToggleButton className="hidden sm:inline-grid md:hidden" />
        <AppearanceMenu placement="header" className="md:hidden" />
      </div>
    </header>
  );
}

/**
 * Plain page title for the header. Pages whose content has no other H1
 * render it as the H1 (`as="h1"`).
 * @param {{ as?: "h1" | "p", children: import("react").ReactNode }} props
 */
export function PageHeaderTitle({ as: Tag = "p", children }) {
  return (
    <Tag className="truncate text-[1.1875rem] font-semibold tracking-[-0.01em] text-(--color-text-primary)">
      {children}
    </Tag>
  );
}
