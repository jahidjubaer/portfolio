import { ImageWithFallback } from "../../components/media/ImageWithFallback";

/**
 * A single gallery thumbnail. Clicking it opens the shared viewer on this
 * photograph — the click handler also hands back the trigger element so
 * the viewer can return focus to it on close.
 * @param {{
 *   photograph: import("../../data/photography").Photograph,
 *   onSelect: (photograph: object, triggerElement: HTMLElement) => void,
 * }} props
 */
export function PhotographyCard({ photograph, onSelect }) {
  function handleClick(event) {
    onSelect(photograph, event.currentTarget);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group block w-full overflow-hidden rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-primary)"
    >
      <ImageWithFallback
        src={photograph.src}
        fallbackSrc="/assets/placeholders/photography-placeholder.svg"
        alt={photograph.alt}
        className="aspect-4/3 w-full object-cover transition-transform duration-(--duration-standard) group-hover:scale-105"
        loading="lazy"
      />
    </button>
  );
}
