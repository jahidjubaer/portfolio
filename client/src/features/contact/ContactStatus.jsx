import { forwardRef } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const STATUS_META = {
  loading: {
    icon: Loader2,
    role: "status",
    className: "text-(--color-text-secondary)",
    iconClassName: "animate-spin",
  },
  success: {
    icon: CheckCircle2,
    role: "status",
    className: "text-(--color-success)",
  },
  error: {
    icon: AlertCircle,
    role: "alert",
    className: "text-(--color-danger)",
  },
};

/**
 * Announces contact-form submission state. Status is never conveyed by
 * color alone — an icon and explicit text always accompany it. Success and
 * error are `tabIndex={-1}` so the form can programmatically move focus to
 * the result without adding an extra tab stop for keyboard users.
 * @param {{ state: "loading" | "success" | "error", message: string, className?: string }} props
 */
export const ContactStatus = forwardRef(function ContactStatus(
  { state, message, className = "" },
  ref,
) {
  const meta = STATUS_META[state];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <div
      ref={ref}
      role={meta.role}
      tabIndex={-1}
      className={cn(
        "body-sm mt-6 flex items-start gap-2 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-4",
        meta.className,
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        size={18}
        className={cn("mt-0.5 shrink-0", meta.iconClassName)}
      />
      <span>{message}</span>
    </div>
  );
});
