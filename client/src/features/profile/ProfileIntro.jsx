import { Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { TechLogo } from "../../components/icons/TechIcons";
import { cn } from "../../lib/cn";
import { profile } from "../../data/profile";
import { navSetting, siteSettings } from "../../data/settings";
import { nowStudying } from "../../data/learning";
import { assetManifest } from "../../generated/asset-manifest";
import { DURATIONS, EASE_STANDARD } from "../motion/motion-config";
import { fadeUpVariants } from "../motion/motion-variants";
import { HEADLINE_TECH } from "./headline-tech";
import { INTRO_MS } from "./viewfinder";

const READOUT = "font-mono text-[0.8125rem] uppercase tracking-[0.08em]";

/** One frame on the stack's film strip; dashed while still being learned. */
function FilmFrame({ name, learning, index }) {
  return (
    <li className={cn("film-frame", learning && "film-frame-learning")}>
      <span aria-hidden="true" className="film-frame-number">
        {String(index + 1).padStart(2, "0")}
      </span>
      <TechLogo name={name} size={22} className="text-white" />
      <span className="film-frame-label">
        {name}
        {learning ? (
          <span className="sr-only"> (currently learning)</span>
        ) : null}
      </span>
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

// The journal's current topic (R3), linked to it while /learning is shown.
const showNowStudying =
  nowStudying && navSetting("/learning", "Learning").visible;

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
            // Lands as the banner's focus point reaches the portrait.
            delay: INTRO_MS / 1000 - 0.25,
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
        <span className="text-balance font-sans text-[0.9375rem] font-semibold normal-case tracking-normal text-(--color-text-primary)">
          <Briefcase
            size={16}
            aria-hidden="true"
            className="mr-1.5 inline align-[-0.15em] text-(--color-text-secondary)"
          />
          {profile.title}
        </span>
      </p>

      {showNowStudying ? (
        <p className={cn(READOUT, "mt-2.5 text-(--color-text-secondary)")}>
          <Link
            to="/learning#now"
            className="inline-flex min-h-11 items-center gap-2 underline decoration-transparent underline-offset-4 hover:decoration-(--color-accent-primary)"
          >
            <span className="text-(--color-accent-primary)">
              ▸ Now studying
            </span>
            <span className="normal-case tracking-normal text-(--color-text-primary)">
              {nowStudying.topic}
            </span>
          </Link>
        </p>
      ) : null}

      <div className="film-strip mx-auto mt-6 max-w-2xl">
        <p aria-hidden="true" className="film-strip-print">
          <span>▸ Stack</span>
          <span className="flex gap-3">
            <span>■ building</span>
            <span className="text-white/45">⬚ learning</span>
          </span>
        </p>
        <ul
          aria-label="Main technologies"
          className="flex flex-wrap justify-center gap-1.5 sm:flex-nowrap"
        >
          {HEADLINE_TECH.map((tech, index) => (
            <FilmFrame key={tech.name} index={index} {...tech} />
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
