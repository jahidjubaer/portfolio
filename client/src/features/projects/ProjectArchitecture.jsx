import { ChevronDown } from "lucide-react";

/**
 * Accessible HTML/CSS architecture diagram — a stacked, ordered list of
 * layers, not a raster image. Stacks cleanly at every viewport because it
 * never leaves a single-column flow.
 * @param {{ layers: import("../../data/projects").ArchitectureLayer[] }} props
 */
export function ProjectArchitecture({ layers }) {
  if (!layers || layers.length === 0) return null;

  return (
    <ol className="flex flex-col items-stretch gap-2">
      {layers.map((layer, index) => (
        <li key={layer.name}>
          <div className="rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-4">
            <p className="font-mono text-sm font-medium text-(--color-text-primary)">
              {layer.name}
            </p>
            <p className="body-sm mt-1 text-(--color-text-secondary)">
              {layer.description}
            </p>
          </div>
          {index < layers.length - 1 ? (
            <ChevronDown
              aria-hidden="true"
              className="mx-auto my-1 text-(--color-text-muted)"
              size={16}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
