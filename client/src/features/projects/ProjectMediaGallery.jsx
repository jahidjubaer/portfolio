import { ImageWithFallback } from "../../components/media/ImageWithFallback";

/**
 * Renders only available screenshots for a project. Captions come from
 * known `captionsByFile` data when available (see the project's
 * `caseStudy.gallery` entries); files without a known caption get a
 * neutral fallback label. Renders nothing when there are no images —
 * callers should skip this section entirely in that case rather than
 * showing a screenshot placeholder.
 * @param {{
 *   title: string,
 *   images: { file: string, src: string }[],
 *   captionsByFile?: Record<string, string>,
 *   className?: string,
 * }} props
 */
export function ProjectMediaGallery({
  title,
  images,
  captionsByFile = {},
  className = "",
}) {
  if (!images || images.length === 0) return null;

  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim()}
    >
      {images.map((image, index) => {
        const caption =
          captionsByFile[image.file] ??
          `${title} interface preview ${index + 1}`;
        return (
          <figure
            key={image.file}
            className="overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-(--color-surface)"
          >
            <ImageWithFallback
              src={image.src}
              fallbackSrc="/assets/placeholders/project-screenshot-placeholder.svg"
              alt={caption}
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
            <figcaption className="body-sm px-3 py-2 text-(--color-text-secondary)">
              {caption}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
