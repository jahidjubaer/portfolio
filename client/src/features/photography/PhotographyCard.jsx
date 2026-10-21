import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { FocusBrackets } from "../../components/ui/FocusBrackets";
import { detectTextLanguage } from "../../lib/language";

/**
 * A single gallery thumbnail, framed like a frame on a contact sheet: a
 * dark film border with the frame number and caption printed along the
 * edge. Clicking it opens the shared viewer on this photograph — the
 * click handler also hands back the trigger element so the viewer can
 * return focus to it on close.
 * @param {{
 *   photograph: import("../../data/photography").Photograph,
 *   frame: number,
 *   onSelect: (photograph: object, triggerElement: HTMLElement) => void,
 * }} props
 */
export function PhotographyCard({ photograph, frame, onSelect }) {
  function handleClick(event) {
    onSelect(photograph, event.currentTarget);
  }
  const caption = photograph.title ?? photograph.category;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="has-brackets group block w-full rounded-(--radius-sm) bg-[#141414] p-1.5 pb-0 text-left shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-[translate,box-shadow] duration-(--duration-standard) ease-(--ease-standard) motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_14px_30px_-14px_rgba(0,0,0,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-primary)"
    >
      <FocusBrackets />
      <span
        data-photo-id={photograph.id}
        className="block overflow-hidden rounded-[0.1875rem]"
      >
        <ImageWithFallback
          src={photograph.src}
          fallbackSrc="/assets/placeholders/photography-placeholder.svg"
          alt={photograph.alt}
          width={photograph.width}
          height={photograph.height}
          className="aspect-4/3 w-full object-cover transition-transform duration-(--duration-slow) ease-(--ease-standard) motion-safe:group-hover:scale-105"
          loading="lazy"
        />
      </span>
      <span
        aria-hidden="true"
        className="flex items-center gap-2 px-0.5 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[#f5b94a]/85"
      >
        <span className="tabular-nums">{String(frame).padStart(2, "0")}</span>
        <span className="text-[#f5b94a]/45">▸</span>
        <span
          lang={detectTextLanguage(caption)}
          className="min-w-0 truncate normal-case tracking-normal text-white/60"
        >
          {caption}
        </span>
      </span>
    </button>
  );
}
