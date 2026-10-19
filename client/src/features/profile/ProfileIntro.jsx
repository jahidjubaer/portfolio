import { Briefcase, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { LocalTime } from "../../components/ui/LocalTime";
import { cn } from "../../lib/cn";
import { profile } from "../../data/profile";
import { capabilityGroups } from "../../data/capabilities";
import { assetManifest } from "../../generated/asset-manifest";
import { fadeUpVariants } from "../motion/motion-variants";

// Small brand-colored badges for the headline chips. Purely decorative —
// the technology name is always the visible text.
const TECH_BADGES = {
  React: { glyph: "⚛", bg: "#20232a", fg: "#61dafb" },
  JavaScript: { glyph: "JS", bg: "#f7df1e", fg: "#111" },
  "Tailwind CSS": { glyph: "~", bg: "#0b1120", fg: "#38bdf8" },
  HTML: { glyph: "5", bg: "#e34f26", fg: "#fff" },
  CSS: { glyph: "3", bg: "#663399", fg: "#fff" },
  "Git & GitHub": { glyph: "G", bg: "#f05032", fg: "#fff" },
  "C++": { glyph: "C+", bg: "#00599c", fg: "#fff" },
  "Node.js": { glyph: "N", bg: "#3c873a", fg: "#fff" },
  "Express.js": { glyph: "ex", bg: "#2b2b2b", fg: "#fff" },
  MongoDB: { glyph: "M", bg: "#13aa52", fg: "#fff" },
};

const strengths = capabilityGroups.find(
  (group) => group.id === "current-strengths",
);
const expanding = capabilityGroups.find(
  (group) => group.id === "currently-expanding",
);

// Headline chips: today's strengths, the competitive-programming
// language, then the first back-end tools being learned (dashed).
const HEADLINE_TECH = [
  ...strengths.items
    .filter((item) => TECH_BADGES[item])
    .map((name) => ({ name, learning: false })),
  { name: profile.problemSolving.primaryLanguage, learning: false },
  ...expanding.items
    .filter((item) => TECH_BADGES[item])
    .map((name) => ({ name, learning: true })),
];

function TechChip({ name, learning }) {
  const badge = TECH_BADGES[name];
  return (
    <li
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-(--color-surface-raised) py-1 pl-1.5 pr-3 text-sm font-semibold",
        learning
          ? "border-dashed border-(--color-border-strong) font-medium text-(--color-text-secondary)"
          : "border-(--color-border) text-(--color-text-primary)",
      )}
    >
      <span
        aria-hidden="true"
        className="inline-grid size-5 place-items-center rounded-full text-[0.5625rem] font-extrabold"
        style={{ background: badge.bg, color: badge.fg }}
      >
        {badge.glyph}
      </span>
      {name}
      {learning ? <span className="sr-only">(currently learning)</span> : null}
    </li>
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
      </div>

      <h1 className="mt-3 text-[1.75rem] font-bold tracking-[-0.03em] text-(--color-text-primary) sm:text-[1.875rem]">
        {profile.name}
      </h1>
      <p className="mt-1 text-[1.0625rem] text-(--color-text-primary) sm:text-lg">
        {profile.heroHeadline}
      </p>
      <p className="mt-3.5 inline-flex items-center gap-2.5 rounded-full border border-(--color-accent-primary)/30 bg-(--color-accent-primary-soft) px-3.5 py-1.5 text-[0.9375rem] font-semibold text-(--color-accent-primary)">
        <span className="status-dot" aria-hidden="true" />
        Open to new roles
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[0.9375rem] text-(--color-text-secondary)">
        <span className="font-semibold text-(--color-text-primary)">
          <Briefcase
            size={16}
            aria-hidden="true"
            className="mr-1.5 inline align-[-0.15em] text-(--color-text-secondary)"
          />
          {profile.title}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={16} aria-hidden="true" />
          {profile.location.split(",")[0]} ·{" "}
          <LocalTime className="tabular-nums" />
        </span>
      </div>

      <ul
        aria-label="Main technologies"
        className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2"
      >
        {HEADLINE_TECH.map((tech) => (
          <TechChip key={tech.name} {...tech} />
        ))}
      </ul>
    </motion.div>
  );
}
