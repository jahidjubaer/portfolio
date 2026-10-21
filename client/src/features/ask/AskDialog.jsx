import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { fadeVariants } from "../motion/motion-variants";
import { DURATIONS, EASE_STANDARD } from "../motion/motion-config";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { IconButton } from "../../components/ui/IconButton";
import { askQuestion } from "../../lib/api";
import { cn } from "../../lib/cn";
import { detectTextLanguage } from "../../lib/language";
import { sourceLabel } from "./ask-sources";

// The server accepts up to 300 characters (askRoutes.js).
const QUESTION_MAX = 300;

const SUGGESTIONS = [
  "What has Jahid built?",
  "Which technologies does he use?",
  "What is he learning now?",
];

const panelVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.standard, ease: EASE_STANDARD },
  },
};

function getFocusable(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function Turn({ turn, onNavigate }) {
  return (
    <li className="grid gap-2">
      <p
        lang={detectTextLanguage(turn.question)}
        className="max-w-[85%] justify-self-end rounded-(--radius-md) rounded-br-sm bg-(--color-accent-primary-soft) px-3.5 py-2 text-[0.9375rem] text-(--color-text-primary)"
      >
        {turn.question}
      </p>
      {turn.status === "loading" ? (
        <p className="flex items-center gap-1.5 px-1 py-2 text-(--color-text-muted)">
          <span className="sr-only">Finding an answer…</span>
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              aria-hidden="true"
              className="ask-dot size-1.5 rounded-full bg-current"
              style={{ animationDelay: `${dot * 140}ms` }}
            />
          ))}
        </p>
      ) : null}
      {turn.status === "error" ? (
        <p
          role="alert"
          className="max-w-[90%] rounded-(--radius-md) border border-(--color-danger)/40 px-3.5 py-2 text-[0.9375rem] text-(--color-danger)"
        >
          {turn.error}
        </p>
      ) : null}
      {turn.status === "done" ? (
        <div className="max-w-[90%] rounded-(--radius-md) rounded-bl-sm border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5">
          <p
            lang={detectTextLanguage(turn.answer)}
            className="text-[0.9375rem] text-(--color-text-secondary)"
          >
            {turn.answer}
          </p>
          {turn.sources.length ? (
            <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <span className="text-(--color-text-muted)">From:</span>
              {turn.sources.map((path) => (
                <Link
                  key={path}
                  to={path}
                  onClick={onNavigate}
                  className="inline-flex min-h-11 items-center font-medium text-(--color-text-primary) underline decoration-(--color-border-strong) underline-offset-4 hover:decoration-(--color-accent-primary) sm:min-h-0"
                >
                  {sourceLabel(path)}
                </Link>
              ))}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function AskPanel({ turns, onAsk, onClose, triggerRef }) {
  const [question, setQuestion] = useState("");
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const titleId = useId();
  const busy = turns.at(-1)?.status === "loading";

  useBodyScrollLock(true);

  useEffect(() => {
    inputRef.current?.focus();
    const trigger = triggerRef?.current;
    return () => trigger?.focus?.();
  }, [triggerRef]);

  // Keep the latest answer in view as the conversation grows.
  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [turns]);

  function submit(text) {
    const trimmed = text.trim();
    if (trimmed.length < 3 || busy) return;
    onAsk(trimmed);
    setQuestion("");
    inputRef.current?.focus();
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit(question);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusable(panelRef.current);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-(--z-overlay) flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onMouseDown={handleBackdropClick}
    >
      {/* Keydown here traps Tab inside the dialog and closes it on Escape. */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        variants={panelVariants}
        className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-(--radius-lg) border border-(--color-border-strong) bg-(--color-surface-raised) shadow-(--shadow-md) sm:rounded-(--radius-lg)"
      >
        <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-2">
          <Sparkles
            size={18}
            aria-hidden="true"
            className="text-(--color-accent-primary)"
          />
          <h2
            id={titleId}
            className="flex-1 font-semibold text-(--color-text-primary)"
          >
            Ask about Jahid
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {turns.length === 0 ? (
            <div>
              <p className="text-[0.9375rem] text-(--color-text-secondary)">
                Ask anything about his projects, skills, and experience. Answers
                come only from what&apos;s on this site.
              </p>
              <ul
                className="mt-4 flex flex-wrap gap-2"
                aria-label="Suggestions"
              >
                {SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => submit(suggestion)}
                      className="min-h-11 rounded-(--radius-pill) border border-(--color-border) px-3.5 text-sm text-(--color-text-secondary) transition-colors hover:border-(--color-border-strong) hover:text-(--color-text-primary)"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <ol
            aria-live="polite"
            aria-busy={busy}
            aria-label="Conversation"
            className={cn("grid gap-4", turns.length === 0 && "hidden")}
          >
            {turns.map((turn) => (
              <Turn key={turn.id} turn={turn} onNavigate={onClose} />
            ))}
          </ol>
          <div ref={endRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-(--color-border) px-4 pb-3 pt-3"
        >
          <div className="flex items-center gap-2">
            <label htmlFor={`${titleId}-question`} className="sr-only">
              Your question
            </label>
            <input
              id={`${titleId}-question`}
              ref={inputRef}
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={QUESTION_MAX}
              autoComplete="off"
              placeholder="Type a question…"
              className="min-h-11 w-full rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) px-3.5 text-[0.9375rem] text-(--color-text-primary) placeholder:text-(--color-text-muted) focus-visible:border-(--color-accent-primary) focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || question.trim().length < 3}
              aria-label="Ask"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-(--color-accent-fill) text-(--color-on-accent-primary) transition-opacity disabled:opacity-40"
            >
              <ArrowUp size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-xs text-(--color-text-muted)">
            AI answers from this site&apos;s content; they can be wrong. Nothing
            you type is saved.
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}

/**
 * The "Ask about Jahid" dialog. The conversation lives here (outside the
 * panel), so closing and reopening keeps it for the visit; nothing is
 * sent anywhere but the question itself.
 * @param {{ open: boolean, onClose: () => void, triggerRef: import("react").RefObject<HTMLElement> }} props
 */
export function AskDialog({ open, onClose, triggerRef }) {
  const [turns, setTurns] = useState([]);
  const nextId = useRef(0);

  function update(id, changes) {
    setTurns((current) =>
      current.map((turn) => (turn.id === id ? { ...turn, ...changes } : turn)),
    );
  }

  async function ask(question) {
    nextId.current += 1;
    const id = nextId.current;
    setTurns((current) => [...current, { id, question, status: "loading" }]);
    try {
      const { answer, sources } = await askQuestion(question);
      update(id, { status: "done", answer, sources });
    } catch (error) {
      update(id, { status: "error", error: error.message });
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <AskPanel
          turns={turns}
          onAsk={ask}
          onClose={onClose}
          triggerRef={triggerRef}
        />
      ) : null}
    </AnimatePresence>
  );
}
