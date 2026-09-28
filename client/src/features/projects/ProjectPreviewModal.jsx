import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { fadeVariants } from "../motion/motion-variants";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { IconButton } from "../../components/ui/IconButton";
import { cn } from "../../lib/cn";
import { getProjectMedia } from "../../lib/project-assets";
import { ProjectStack } from "./ProjectStack";

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

const VIEWPORT_OPTIONS = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "w-full max-w-5xl" },
  {
    id: "tablet",
    label: "Tablet",
    icon: Tablet,
    width: "w-[768px] max-w-full",
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    width: "w-[375px] max-w-full",
  },
];

/**
 * Accessible live-preview dialog for a project, built on the same manual
 * focus-trap pattern as PhotographyViewer/MobileMenu. With a live URL it
 * embeds the deployed site in a sandboxed iframe at selectable viewport
 * widths; without one it honestly presents a static snapshot instead.
 * Focus returns to whichever element opened it.
 * @param {{ project: import("../../data/projects").Project, onClose: () => void }} props
 */
export function ProjectPreviewModal({ project, onClose }) {
  const [viewport, setViewport] = useState("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const panelRef = useRef(null);
  const titleId = useId();

  useBodyScrollLock(true);

  useEffect(() => {
    const opener = document.activeElement;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    getFocusableElements(panelRef.current)[0]?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (opener instanceof HTMLElement && document.contains(opener)) {
        opener.focus();
      }
    };
  }, [onClose]);

  if (!project) return null;

  const { cover } = getProjectMedia(project.slug);
  const liveUrl = project.links.find(
    (l) => l.type === "live" || l.type === "demo",
  )?.url;
  const activeWidth = VIEWPORT_OPTIONS.find((o) => o.id === viewport).width;

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 z-(--z-overlay) flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={(event) => {
        // Backdrop click only — clicks inside the panel bubble here with a
        // different target, so they never match and never close.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-canvas) shadow-2xl"
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--color-border) bg-(--color-surface) px-4 py-2">
          <div className="flex items-center gap-3">
            <h3
              id={titleId}
              className="font-semibold text-(--color-text-primary)"
            >
              {project.title} — {liveUrl ? "Live Preview" : "Project Snapshot"}
            </h3>
            <span className="rounded-full bg-(--color-accent-primary-soft) px-2.5 py-0.5 font-mono text-xs text-(--color-accent-primary)">
              {liveUrl ? "Interactive" : "Static"}
            </span>
          </div>

          {/* Viewport width switcher — only meaningful for the live iframe */}
          {liveUrl ? (
            <div
              role="group"
              aria-label="Preview viewport width"
              className="hidden items-center gap-1 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft) p-1 sm:flex"
            >
              {VIEWPORT_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewport(id)}
                  aria-pressed={viewport === id}
                  className={cn(
                    "flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
                    viewport === id
                      ? "bg-(--color-accent-primary) text-(--color-on-accent-primary)"
                      : "text-(--color-text-muted) hover:text-(--color-text-primary)",
                  )}
                >
                  <Icon aria-hidden="true" size={14} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ) : null}

          {/* Actions & Close */}
          <div className="flex items-center gap-1">
            {liveUrl ? (
              <>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-soft) px-3 text-xs font-medium text-(--color-text-primary) transition-colors hover:border-(--color-accent-primary)"
                >
                  <span>Open Link</span>
                  <ExternalLink aria-hidden="true" size={13} />
                </a>
                <IconButton
                  variant="secondary"
                  label="Reload preview"
                  onClick={() => setReloadKey((prev) => prev + 1)}
                >
                  <RefreshCw aria-hidden="true" size={16} />
                </IconButton>
              </>
            ) : null}
            <IconButton
              variant="secondary"
              label="Close preview"
              onClick={onClose}
            >
              <X aria-hidden="true" size={20} />
            </IconButton>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 overflow-auto bg-(--color-canvas-subtle) p-4">
          {liveUrl ? (
            <>
              <div
                className={cn(
                  "h-full overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-white shadow-xl transition-all duration-300",
                  activeWidth,
                )}
              >
                <iframe
                  key={reloadKey}
                  src={liveUrl}
                  title={`${project.title} live preview`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  referrerPolicy="no-referrer"
                  className="h-full w-full border-0"
                />
              </div>
              <p className="body-sm text-(--color-text-muted)">
                If the preview stays blank, the site may not allow embedding —
                use “Open Link” above instead.
              </p>
            </>
          ) : (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-4 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-xl",
                activeWidth,
              )}
            >
              <div className="max-w-md">
                <ImageWithFallback
                  src={cover.src}
                  fallbackSrc={cover.fallback}
                  alt={`${project.title} project cover`}
                  className="mx-auto rounded-(--radius-md) object-cover"
                />
                <h4 className="heading-md mt-4 text-(--color-text-primary)">
                  {project.title}
                </h4>
                <p className="body-sm mt-2 text-(--color-text-secondary)">
                  {project.summary}
                </p>
                <ProjectStack
                  stack={project.stack}
                  className="mt-4 justify-center"
                />
                <p className="body-sm mt-4 text-(--color-text-muted)">
                  No live deployment is available for this project yet, so this
                  is a static snapshot rather than an interactive preview.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
