import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";
import { Mail, X } from "lucide-react";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { usePreferences } from "../preferences/usePreferences";
import { greeting } from "../../data/greeting";
import { profile } from "../../data/profile";
import { assetManifest } from "../../generated/asset-manifest";

export const GREETING_DELAY_MS = 5000;
export const GREETING_SEEN_KEY = "greeting-seen";

// Pages where a "how can I help?" note is redundant.
const HIDDEN_ON = ["/contact"];

const REPLY =
  "flex min-h-11 w-full items-center rounded-(--radius-sm) border border-(--color-border) bg-(--color-surface-raised) px-3 text-sm font-semibold text-(--color-text-primary) transition-colors hover:border-(--color-accent-primary) hover:text-(--color-accent-primary)";

function hasSeenGreeting() {
  try {
    return window.sessionStorage.getItem(GREETING_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markGreetingSeen() {
  try {
    window.sessionStorage.setItem(GREETING_SEEN_KEY, "1");
  } catch {
    // Without storage the greeting may simply show again next visit.
  }
}

/**
 * The greeting as a note in the site's viewfinder style: corner marks, a
 * mono caption, and a square print of Jahid that develops as it opens.
 * It slides in at the bottom right a few seconds after a visitor arrives
 * — once per browser session. It never takes focus or blocks the page;
 * quick replies open the contact form with the subject pre-filled.
 */
export function GreetingPopup() {
  const { pathname } = useLocation();
  const { play } = usePreferences();
  const [open, setOpen] = useState(false);
  const hiddenHere = HIDDEN_ON.includes(pathname);

  useEffect(() => {
    if (hiddenHere || hasSeenGreeting()) return undefined;
    const timer = window.setTimeout(() => {
      markGreetingSeen();
      setOpen(true);
      // Browsers block audio before the visitor has interacted.
      if (navigator.userActivation?.hasBeenActive) play("message");
    }, GREETING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hiddenHere, play]);

  function close() {
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") close();
  }

  const portrait = assetManifest.profile.portraitSquare;
  const firstName = profile.name.split(" ")[0];

  return (
    <AnimatePresence>
      {open && !hiddenHere ? (
        <motion.aside
          aria-label={`Message from ${firstName}`}
          onKeyDown={handleKeyDown}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed right-4 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] z-(--z-header) w-[min(22rem,calc(100vw-2rem))] origin-bottom-right rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)] md:right-6 md:bottom-6"
        >
          <FocusBrackets locked inside />

          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-(--color-text-muted)">
              <span
                aria-hidden="true"
                className="text-(--color-accent-primary)"
              >
                ▸{" "}
              </span>
              A note from {firstName}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close message"
              className="-mt-2 -mr-2 inline-grid size-10 shrink-0 place-items-center rounded-full text-(--color-text-muted) hover:bg-(--color-surface-raised) hover:text-(--color-text-primary)"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-1 flex gap-3.5">
            {/* A small print with a film border; it "develops" in. */}
            <span className="relative h-fit shrink-0 rounded-[0.1875rem] bg-[#141414] p-1">
              <ImageWithFallback
                src={portrait.src}
                fallbackSrc={portrait.fallback}
                alt=""
                width={56}
                height={56}
                className="size-14 rounded-[0.125rem] object-cover"
              />
              <motion.span
                aria-hidden="true"
                className="absolute inset-1 rounded-[0.125rem] bg-[#141414]"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 1.1, ease: "easeOut" }}
              />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-(--color-text-primary)">
                {greeting.salutation}
              </p>
              <p className="mt-1 text-[0.9375rem] text-(--color-text-secondary)">
                {greeting.message}
              </p>
            </div>
          </div>

          <ul
            aria-label="Quick replies"
            className="mt-4 grid grid-cols-2 gap-2"
          >
            {greeting.quickReplies.map((reply) => (
              <li key={reply.subject}>
                <Link
                  to={`/contact?subject=${encodeURIComponent(reply.subject)}`}
                  onClick={() => {
                    play("tap");
                    close();
                  }}
                  className={REPLY}
                >
                  {reply.label}
                </Link>
              </li>
            ))}
            <li className="col-span-2">
              <a
                href={`mailto:${profile.email}`}
                onClick={close}
                className={cn(
                  REPLY,
                  "justify-center gap-1.5 border-dashed text-(--color-text-secondary)",
                )}
              >
                <Mail size={15} aria-hidden="true" />
                Email me
              </a>
            </li>
          </ul>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
