import { cn } from "../../lib/cn";

/**
 * Card whose border and inner glow follow the pointer (see `.spotlight` in
 * utilities.css). Pointer position is written straight to CSS variables —
 * no React state, so moving the mouse never re-renders. Touch and keyboard
 * users get the same card without the effect (focus-within lights it).
 * @param {{
 *   as?: keyof JSX.IntrinsicElements,
 *   className?: string,
 *   children: import("react").ReactNode,
 * } & import("react").HTMLAttributes<HTMLElement>} props
 */
export function SpotlightCard({
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) {
  function handlePointerMove(event) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--spot-x",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--spot-y",
      `${event.clientY - rect.top}px`,
    );
  }

  return (
    <Tag
      className={cn(
        "spotlight rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface)",
        className,
      )}
      onPointerMove={handlePointerMove}
      {...rest}
    >
      {children}
    </Tag>
  );
}
