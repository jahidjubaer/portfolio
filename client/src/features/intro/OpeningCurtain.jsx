import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePreferences } from "../preferences/usePreferences";
import { profile } from "../../data/profile";
import { cn } from "../../lib/cn";
import { siteSettings } from "../../data/settings";
import { TEAR_OVERLAP_PX, tornClipPath } from "./torn-edge";
import { HOLD_MS, OPENING_SEEN_KEY, REPLAY_EVENT } from "./opening-state";
import { ApertureSheet } from "./ApertureSheet";
import { useIsHydrating } from "../../lib/hydration";

// The sheet rests closed for HOLD_MS, then tears open. Total stays near a
// second, and any key, click, or scroll skips straight to the end.
const OPEN_SECONDS = 0.85;
const SKIP_SECONDS = 0.32;
const EASE_TEAR = [0.76, 0, 0.24, 1];
const FIBRE_PX = 3;

const OPEN_POSE = {
  left: { x: "-104%", rotateY: 16 },
  right: { x: "104%", rotateY: -16 },
};
const CLOSED_POSE = { x: 0, rotateY: 0 };

// Faint ruled lines, and a shade that deepens toward the tear so each
// half reads as a page lifting away.
const RULED_LINES =
  "repeating-linear-gradient(to bottom, transparent 0 calc(2rem - 1px), var(--color-paper-rule) calc(2rem - 1px) 2rem)";
const PAPER_STYLE = {
  left: {
    backgroundColor: "var(--color-paper)",
    backgroundImage: `linear-gradient(to left, var(--color-paper-shade), transparent 4rem), ${RULED_LINES}`,
  },
  right: {
    backgroundColor: "var(--color-paper)",
    backgroundImage: `linear-gradient(to right, var(--color-paper-shade), transparent 4rem), ${RULED_LINES}`,
  },
};

// Switched on or off, with or without sound, and its style (camera
// aperture, torn pages, or a clean split) in Site settings.
const { intro } = siteSettings;

function shouldPlayOnLoad() {
  if (!intro.enabled) return false;
  // Automated browsers (Playwright, crawlers) go straight to the content.
  if (navigator.webdriver) return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  try {
    return window.sessionStorage.getItem(OPENING_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(OPENING_SEEN_KEY, "1");
  } catch {
    // Without storage the opening may simply play again next visit.
  }
}

// Browsers block audio until the visitor has clicked or pressed a key.
function canPlayAudio() {
  return Boolean(navigator.userActivation?.hasBeenActive);
}

/**
 * The name, positioned at the viewport's centre inside each half, so the
 * tear runs straight through it and each half carries its own piece.
 * @param {{ side: "left" | "right" }} props
 */
function SeamTitle({ side }) {
  return (
    <div
      className="absolute top-1/2 w-max -translate-x-1/2 -translate-y-1/2 text-center"
      style={{
        left:
          side === "left"
            ? `calc(100% - ${TEAR_OVERLAP_PX}px)`
            : `${TEAR_OVERLAP_PX}px`,
      }}
    >
      <p className="text-[clamp(2.75rem,10vw,6.5rem)] leading-none font-bold tracking-[-0.045em] text-(--color-text-primary)">
        {profile.name}
      </p>
      <p className="mono-meta mt-4 text-(--color-text-muted)">
        {profile.title}
      </p>
    </div>
  );
}

/**
 * @param {{ side: "left" | "right", open: boolean, fast: boolean, straight: boolean, onOpened?: () => void }} props
 */
function CurtainHalf({ side, open, fast, straight, onOpened }) {
  return (
    <motion.div
      initial={false}
      animate={open ? OPEN_POSE[side] : CLOSED_POSE}
      transition={{
        duration: fast ? SKIP_SECONDS : OPEN_SECONDS,
        ease: EASE_TEAR,
      }}
      onAnimationComplete={() => {
        if (open) onOpened?.();
      }}
      className={cn(
        "absolute inset-y-0 drop-shadow-[0_0_22px_rgba(0,0,0,0.28)] will-change-transform",
        side === "left" ? "left-0 origin-left" : "right-0 origin-right",
      )}
      style={{ width: `calc(50% + ${TEAR_OVERLAP_PX}px)` }}
    >
      {/* Lighter paper fibres peek out along the tear. */}
      {straight ? null : (
        <div
          className="absolute inset-0 bg-(--color-paper-fibre)"
          style={{ clipPath: tornClipPath(side, FIBRE_PX) }}
        />
      )}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          ...PAPER_STYLE[side],
          clipPath: tornClipPath(side, 0, straight),
        }}
      >
        <SeamTitle side={side} />
      </div>
    </motion.div>
  );
}

/**
 * Opening animation, in the style chosen in Site settings: a camera
 * aperture opening onto the page (with a shutter sound), or one sheet
 * that tears (or splits) down the middle and swings open (with a paper
 * sound), when the browser allows audio. Once per session, never under
 * reduced motion, purely decorative (aria-hidden) — the real page is
 * rendered underneath from the first frame, so nothing waits on it.
 * @param {{ style?: "aperture" | "torn" | "split" }} props
 */
export function OpeningCurtain({ style = intro.style }) {
  const aperture = style === "aperture";
  const reduceMotion = useReducedMotion();
  const { play } = usePreferences();
  const hydrating = useIsHydrating();
  // 0 = not showing; each run gets a new key so a replay starts fresh.
  // A prerendered page decides after hydration (the server can't know).
  const [run, setRun] = useState(() => {
    if (hydrating) return 0;
    return shouldPlayOnLoad() ? 1 : 0;
  });
  const [open, setOpen] = useState(false);
  const [fast, setFast] = useState(false);
  const soundPlayedRef = useRef(false);
  const showing = run > 0 && !reduceMotion;

  const playTearSound = useCallback(() => {
    if (!intro.sound || soundPlayedRef.current || !canPlayAudio()) return;
    soundPlayedRef.current = true;
    play(aperture ? "shutter" : "pageOpen");
  }, [play, aperture]);

  useEffect(() => {
    if (!intro.enabled) return undefined;
    function handleReplay() {
      soundPlayedRef.current = false;
      setOpen(false);
      setFast(false);
      setRun((current) => current + 1);
    }
    window.addEventListener(REPLAY_EVENT, handleReplay);
    return () => window.removeEventListener(REPLAY_EVENT, handleReplay);
  }, []);

  useEffect(() => {
    if (!showing) return undefined;
    markSeen();
    const timer = window.setTimeout(() => {
      setOpen(true);
      playTearSound();
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [showing, run, playTearSound]);

  useEffect(() => {
    if (!showing) return undefined;
    function skip() {
      setFast(true);
      setOpen(true);
      // A click or key press is the gesture that unlocks audio.
      playTearSound();
    }
    const events = ["keydown", "pointerdown", "wheel", "touchstart"];
    for (const name of events) {
      window.addEventListener(name, skip, { passive: true });
    }
    return () => {
      for (const name of events) window.removeEventListener(name, skip);
    };
  }, [showing, run, playTearSound]);

  // The head script in index.html covers a prerendered page until this
  // point, so its content never flashes before the curtain.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-intro")) return;
    if (shouldPlayOnLoad()) setRun((current) => current || 1);
    root.removeAttribute("data-intro");
  }, []);

  const handleOpened = useCallback(() => setRun(0), []);

  return (
    <AnimatePresence>
      {showing ? (
        <motion.div
          key={run}
          data-testid="opening-curtain"
          aria-hidden="true"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-(--z-curtain) overflow-hidden [perspective:1800px]"
        >
          {aperture ? (
            <ApertureSheet open={open} fast={fast} onOpened={handleOpened} />
          ) : (
            <>
              <CurtainHalf
                side="left"
                open={open}
                fast={fast}
                straight={style === "split"}
                onOpened={handleOpened}
              />
              <CurtainHalf
                side="right"
                open={open}
                fast={fast}
                straight={style === "split"}
              />
            </>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
