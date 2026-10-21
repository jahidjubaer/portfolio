import { motion } from "motion/react";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { LocalTime } from "../../components/ui/LocalTime";
import { cn } from "../../lib/cn";
import { profile } from "../../data/profile";
import { siteSettings } from "../../data/settings";
import { capabilityGroups } from "../../data/capabilities";
import { assetManifest } from "../../generated/asset-manifest";
import { DURATIONS, EASE_STANDARD } from "../motion/motion-config";
import { fadeUpVariants } from "../motion/motion-variants";

// Technologies shown in the header's stack strip, in this order of
// preference within each group.
const HEADLINE_NAMES = new Set([
  "React",
  "JavaScript",
  "Tailwind CSS",
  "HTML",
  "CSS",
  "Git & GitHub",
  "C++",
  "Node.js",
  "Express.js",
  "MongoDB",
]);

const strengths = capabilityGroups.find(
  (group) => group.id === "current-strengths",
);
const expanding = capabilityGroups.find(
  (group) => group.id === "currently-expanding",
);

// Headline stack: today's strengths, the competitive-programming
// language, then the first back-end tools being learned (hollow marker).
const HEADLINE_TECH = [
  ...strengths.items
    .filter((item) => HEADLINE_NAMES.has(item))
    .map((name) => ({ name, learning: false })),
  { name: profile.problemSolving.primaryLanguage, learning: false },
  ...expanding.items
    .filter((item) => HEADLINE_NAMES.has(item))
    .map((name) => ({ name, learning: true })),
];

const READOUT = "font-mono text-[0.8125rem] uppercase tracking-[0.08em]";

function StackMarker({ learning }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-1.5 shrink-0",
        learning
          ? "border border-(--color-text-muted)"
          : "bg-(--color-accent-fill)",
      )}
    />
  );
}

function TechLabel({ name, learning }) {
  return (
    <li
      className={cn(
        "inline-flex items-center gap-2 transition-colors",
        learning ? "text-(--color-text-muted)" : "text-(--color-text-primary)",
      )}
    >
      <StackMarker learning={learning} />
      {name}
      {learning ? <span className="sr-only">(currently learning)</span> : null}
    </li>
  );
}

function ReadoutSeparator() {
  return (
    <span
      aria-hidden="true"
      className="text-(--color-text-muted) max-sm:hidden"
    >
      ·
    </span>
  );
}

/** Avatar, name, headline, status, and headline technologies. */
export function ProfileIntro() {
  const portrait = assetManifest.profile.portraitSquare;
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      className="px-4 text-center sm:px-7"
    >
      <div className="relative mx-auto -mt-14 size-28 sm:-mt-16 sm:size-32">
        <div
          aria-hidden="true"
          className="absolute -inset-3 rounded-full bg-(--color-accent-glow) blur-2xl"
        />
        <ImageWithFallback
          src={portrait.src}
          fallbackSrc={portrait.fallback}
          alt={`Portrait of ${profile.name}`}
          width={128}
          height={128}
          loading="eager"
          fetchPriority="high"
          className="relative size-full rounded-full border-[5px] border-(--color-canvas) bg-(--color-surface-raised) object-cover shadow-[0_0_0_1px_var(--color-border)]"
        />
        {/* Focus lock: the viewfinder corners close in on the portrait. */}
        <motion.span
          aria-hidden="true"
          className="absolute -inset-1"
          initial={{ opacity: 0, scale: 1.35 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.15,
            duration: DURATIONS.slow,
            ease: EASE_STANDARD,
          }}
        >
          <FocusBrackets locked className="inset-0!" />
        </motion.span>
      </div>

      <h1 className="mt-3 text-[1.75rem] font-bold tracking-[-0.03em] text-(--color-text-primary) sm:text-[1.875rem]">
        {profile.name}
      </h1>
      <p className="mt-1 text-[1.0625rem] text-(--color-text-primary) sm:text-lg">
        {profile.heroHeadline}
      </p>
      <p
        className={cn(
          READOUT,
          "mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-(--color-text-secondary)",
        )}
      >
        {siteSettings.openToWorkBadge ? (
          <>
            <span className="inline-flex items-center justify-center gap-2 font-semibold text-(--color-accent-primary) max-sm:basis-full">
              <span className="status-dot" aria-hidden="true" />
              Open to new roles
            </span>
            <ReadoutSeparator />
          </>
        ) : null}
        <span className="text-(--color-text-primary)">{profile.title}</span>
        <span className="inline-flex basis-full items-center justify-center gap-1.5">
          {profile.location.split(",")[0]}
          <LocalTime className="tabular-nums" />
          <span className="text-(--color-text-muted)">GMT+6</span>
        </span>
      </p>

      <ul
        aria-label="Main technologies"
        className={cn(
          READOUT,
          "mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-x-5 gap-y-2 border-y border-(--color-border) px-2 py-3 text-xs",
        )}
      >
        {HEADLINE_TECH.map((tech) => (
          <TechLabel key={tech.name} {...tech} />
        ))}
      </ul>
      <p
        aria-hidden="true"
        className={cn(
          READOUT,
          "mt-2 inline-flex items-center gap-4 text-[0.6875rem] text-(--color-text-muted)",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <StackMarker /> building with
        </span>
        <span className="inline-flex items-center gap-1.5">
          <StackMarker learning /> learning
        </span>
      </p>
    </motion.div>
  );
}
