import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

const CLAMPS = {
  2: "line-clamp-2",
  3: "line-clamp-3",
};

/**
 * LinkedIn's "…more": long text is cut to a few lines with a button to
 * read the rest. The button only appears when the text really overflows,
 * which can only be known after layout, so it is measured once mounted.
 * The full text is always in the DOM, so screen readers and search get
 * all of it.
 * @param {{ text: string, lines?: 2 | 3, className?: string }} props
 */
export function ClampedText({ text, lines = 3, className }) {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || expanded) return undefined;
    function measure() {
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text, expanded]);

  return (
    <div className={className}>
      <p
        ref={ref}
        className={cn(
          "text-[0.9375rem] whitespace-pre-line text-(--color-text-secondary)",
          !expanded && CLAMPS[lines],
        )}
      >
        {text}
      </p>
      {overflows || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="-my-1.5 inline-flex min-h-11 items-center text-sm font-semibold text-(--color-text-secondary) hover:text-(--color-text-primary) hover:underline"
        >
          {expanded ? "Show less" : "…more"}
        </button>
      ) : null}
    </div>
  );
}
