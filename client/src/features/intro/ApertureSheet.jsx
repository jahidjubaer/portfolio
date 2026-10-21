import { useState } from "react";
import { motion } from "motion/react";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { profile } from "../../data/profile";
import { apertureClip } from "../../lib/aperture";

const OPEN_SECONDS = 0.9;
const SKIP_SECONDS = 0.3;
const STEPS = 10;

/**
 * The "aperture" opening style: a dark viewfinder screen with the name
 * and focus corners, which opens from the centre as a turning hexagonal
 * iris onto the page underneath.
 * @param {{ open: boolean, fast: boolean, onOpened?: () => void }} props
 */
export function ApertureSheet({ open, fast, onOpened }) {
  const [size] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const frames = Array.from({ length: STEPS + 1 }, (_, step) =>
    apertureClip(step / STEPS, size.width, size.height),
  );

  return (
    <motion.div
      initial={false}
      animate={{ clipPath: open ? frames : frames[0] }}
      transition={{
        duration: fast ? SKIP_SECONDS : OPEN_SECONDS,
        ease: [0.65, 0, 0.35, 1],
      }}
      onAnimationComplete={() => {
        if (open) onOpened?.();
      }}
      style={{ clipPath: frames[0] }}
      className="absolute inset-0 grid place-items-center bg-[#0b0b0d] text-white"
    >
      <div className="viewfinder-grid absolute inset-0 [--grid-line:rgb(255_255_255/0.07)]" />
      <FocusBrackets
        locked
        className="inset-5! [--bracket-color:#a3e635] [--bracket-len:1.25rem]"
      />
      <div className="relative mx-8 px-6 py-8 text-center sm:px-10">
        <FocusBrackets
          locked
          className="inset-0! [--bracket-color:rgb(255_255_255/0.7)]"
        />
        <p className="text-[clamp(2.25rem,8vw,5rem)] leading-none font-bold tracking-[-0.045em]">
          {profile.name}
        </p>
        <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.14em] text-white/60">
          {profile.title}
        </p>
      </div>
      <p className="absolute bottom-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-[#f5b94a]/80">
        ▸ Focus · {profile.location.split(",")[0]}
      </p>
    </motion.div>
  );
}
