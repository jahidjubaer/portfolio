import { cn } from "../../lib/cn";

/**
 * A track's syllabus progress as a ring, with the fraction in words for
 * screen readers. A real count of topics, never a typed percentage.
 * @param {{ done: number, total: number, size?: number, className?: string }} props
 */
export function ProgressRing({ done, total, size = 44, className }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = total ? done / total : 0;
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-(--color-border)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          className="stroke-(--color-accent-primary)"
        />
      </svg>
      <span
        aria-hidden="true"
        className="mono-meta absolute text-[0.6875rem] text-(--color-text-primary)"
      >
        {done}/{total}
      </span>
      <span className="sr-only">
        {done} of {total} topics done
      </span>
    </span>
  );
}
