import { forwardRef } from "react";
import { getButtonClasses } from "./button-styles";

/**
 * @param {{
 *   variant?: "primary" | "secondary" | "ghost" | "text",
 *   size?: "sm" | "md" | "lg",
 *   disabled?: boolean,
 *   loading?: boolean,
 *   leadingIcon?: import("react").ReactNode,
 *   trailingIcon?: import("react").ReactNode,
 *   type?: "button" | "submit" | "reset",
 *   children: import("react").ReactNode,
 *   className?: string,
 * } & import("react").ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    leadingIcon,
    trailingIcon,
    type = "button",
    children,
    className = "",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={getButtonClasses({
        variant,
        size,
        disabled: disabled || loading,
        className,
      })}
      {...rest}
    >
      {leadingIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {leadingIcon}
        </span>
      ) : null}
      {children}
      {trailingIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
});
