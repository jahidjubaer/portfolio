import { useState } from "react";
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { getProjectMedia } from "../../lib/project-assets";
import { ProjectStack } from "./ProjectStack";

export function ProjectPreviewModal({ project, onClose }) {
  const [viewport, setViewport] = useState("desktop"); // desktop | tablet | mobile
  const [key, setKey] = useState(0);

  if (!project) return null;

  const { cover } = getProjectMedia(project.slug);
  const liveUrl = project.links.find(
    (l) => l.type === "live" || l.type === "demo",
  )?.url;

  const viewportWidths = {
    desktop: "w-full max-w-5xl",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  return (
    <div
      className="fixed inset-0 z-(--z-overlay) flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-canvas) shadow-2xl">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-4 py-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-(--color-text-primary)">
              {project.title} — Sandbox Preview
            </h3>
            <span className="rounded-full bg-(--color-accent-primary-soft) px-2.5 py-0.5 font-mono text-xs text-(--color-accent-primary)">
              Interactive
            </span>
          </div>

          {/* Viewport Controls */}
          <div className="hidden sm:flex items-center gap-1 rounded-(--radius-pill) border border-(--color-border) bg-(--color-surface-soft) p-1">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewport === "desktop"
                  ? "bg-(--color-accent-primary) text-(--color-on-accent-primary)"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
            >
              <Monitor size={14} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewport === "tablet"
                  ? "bg-(--color-accent-primary) text-(--color-on-accent-primary)"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
            >
              <Tablet size={14} />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                viewport === "mobile"
                  ? "bg-(--color-accent-primary) text-(--color-on-accent-primary)"
                  : "text-(--color-text-muted) hover:text-(--color-text-primary)"
              }`}
            >
              <Smartphone size={14} />
              <span>Mobile</span>
            </button>
          </div>

          {/* Actions & Close */}
          <div className="flex items-center gap-2">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-soft) px-3 py-1.5 text-xs font-medium text-(--color-text-primary) transition-colors hover:border-(--color-accent-primary)"
              >
                <span>Open Link</span>
                <ExternalLink size={13} />
              </a>
            )}
            <button
              type="button"
              onClick={() => setKey((prev) => prev + 1)}
              className="p-1.5 text-(--color-text-muted) hover:text-(--color-text-primary)"
              title="Reload preview"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-(--color-text-muted) hover:text-(--color-text-primary)"
              aria-label="Close preview modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-(--color-canvas-subtle) p-4">
          {liveUrl ? (
            <div
              className={`h-full transition-all duration-300 overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-white shadow-xl ${viewportWidths[viewport]}`}
            >
              <iframe
                key={key}
                src={liveUrl}
                title={`${project.title} live demo preview`}
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <div
              className={`flex flex-col items-center justify-center gap-4 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-xl ${viewportWidths[viewport]}`}
            >
              <div className="max-w-md">
                <ImageWithFallback
                  src={cover.src}
                  fallbackSrc={cover.fallback}
                  alt={project.title}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
