import { FrameRule } from "../../components/ui/FrameRule";
import { Reveal } from "../motion/Reveal";

/**
 * One titled block in the profile's Resume tab: icon + H2 with its frame
 * number (see `.frame-heading`), ruled off from the next block.
 * @param {{
 *   id: string,
 *   icon: import("react").ElementType,
 *   title: string,
 *   children: import("react").ReactNode,
 * }} props
 */
export function ProfileSection({ id, icon: Icon, title, children }) {
  return (
    <Reveal
      as="section"
      className="border-b border-(--color-border) px-4 py-8 last:border-b-0 sm:px-7"
    >
      <h2
        id={id}
        className="frame-heading flex items-center gap-3 text-[1.3125rem] font-semibold tracking-[-0.01em] text-(--color-text-primary)"
      >
        <Icon
          size={22}
          aria-hidden="true"
          className="text-(--color-text-secondary)"
        />
        {title}
      </h2>
      <FrameRule className="mt-3 mb-5" />
      {children}
    </Reveal>
  );
}
