import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn";
import { Mail, X } from "lucide-react";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { usePreferences } from "../preferences/usePreferences";
import { greeting } from "../../data/greeting";
import { profile } from "../../data/profile";
import { assetManifest } from "../../generated/asset-manifest";

export const GREETING_DELAY_MS = 5000;
const TYPING_MS = 1200;
export const GREETING_SEEN_KEY = "greeting-seen";

// Pages where a "how can I help?" bubble is redundant.
const HIDDEN_ON = ["/contact"];

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

/** @param {{ className?: string, "aria-hidden"?: "true" }} props */
function GreetingMessage({ className, ...props }) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl rounded-tl-sm bg-(--color-surface-raised) px-4 py-3",
        className,
      )}
    >
      <p className="font-semibold text-(--color-text-primary)">
        {greeting.salutation}
      </p>
      <p className="mt-1 text-[0.9375rem] text-(--color-text-secondary)">
        {greeting.message}
      </p>
    </div>
  );
}

/**
 * Chat-style greeting that slides in at the bottom right a few seconds
 * after a visitor arrives — once per browser session. It never takes
 * focus or blocks the page; quick replies open the contact form with the
 * subject pre-filled.
 */
export function GreetingPopup() {
  const { pathname } = useLocation();
  const { play } = usePreferences();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(true);
  const hiddenHere = HIDDEN_ON.includes(pathname);
  const showTyping = typing && !reduceMotion;

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

  useEffect(() => {
    if (!open || !showTyping) return undefined;
    const timer = window.setTimeout(() => setTyping(false), TYPING_MS);
    return () => window.clearTimeout(timer);
  }, [open, showTyping]);

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
          className="fixed right-4 bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] z-(--z-header) w-[min(22rem,calc(100vw-2rem))] origin-bottom-right rounded-(--radius-xl) border border-(--color-border) bg-(--color-surface) p-4 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)] md:right-6 md:bottom-6"
        >
          <div className="flex items-center gap-3">
            <span className="relative shrink-0">
              <ImageWithFallback
                src={portrait.src}
                fallbackSrc={portrait.fallback}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full border border-(--color-border) object-cover"
              />
              <span
                aria-hidden="true"
                className="status-dot absolute -right-0.5 -bottom-0.5"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-(--color-text-primary)">
                {profile.name}
              </p>
              <p className="text-[0.8125rem] text-(--color-text-muted)">
                {profile.title}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close message"
              className="-mr-1.5 inline-grid size-10 shrink-0 place-items-center rounded-full text-(--color-text-muted) hover:bg-(--color-surface-raised) hover:text-(--color-text-primary)"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          {/* The message and replies keep their space while "typing", so
              the card (pinned to the bottom) doesn't grow upwards and
              shift its own header when they appear. */}
          <div aria-live="polite" className="relative mt-3.5">
            {showTyping ? (
              <p className="absolute top-0 left-0 inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-(--color-surface-raised) px-4 py-3">
                <span className="sr-only">{firstName} is typing</span>
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-(--color-text-muted)"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: dot * 0.15,
                    }}
                  />
                ))}
              </p>
            ) : null}
            {showTyping ? (
              <GreetingMessage aria-hidden="true" className="invisible" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GreetingMessage />
              </motion.div>
            )}
          </div>

          <motion.ul
            aria-label="Quick replies"
            aria-hidden={showTyping || undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: showTyping ? 0 : 1 }}
            transition={{ delay: showTyping ? 0 : 0.15 }}
            className={cn(
              "mt-3 flex flex-wrap gap-2",
              showTyping && "invisible",
            )}
          >
            {greeting.quickReplies.map((reply) => (
              <li key={reply.subject}>
                <Link
                  to={`/contact?subject=${encodeURIComponent(reply.subject)}`}
                  onClick={() => {
                    play("tap");
                    close();
                  }}
                  className="inline-flex min-h-11 items-center rounded-full border border-(--color-accent-primary)/35 bg-(--color-accent-primary-soft) px-3.5 text-sm font-semibold text-(--color-accent-primary) transition-colors hover:border-(--color-accent-primary)"
                >
                  {reply.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${profile.email}`}
                onClick={close}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-(--color-border) px-3.5 text-sm font-medium text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                <Mail size={15} aria-hidden="true" />
                Email me
              </a>
            </li>
          </motion.ul>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
