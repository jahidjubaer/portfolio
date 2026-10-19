import { Reveal } from "../motion/Reveal";

/**
 * One titled block in the profile's Resume tab: icon + H2, ruled off from
 * the next block.
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
        className="mb-5 flex items-center gap-3 text-[1.3125rem] font-semibold tracking-[-0.01em] text-(--color-text-primary)"
      >
        <Icon
          size={22}
          aria-hidden="true"
          className="text-(--color-text-secondary)"
        />
        {title}
      </h2>
      {children}
    </Reveal>
  );
}
