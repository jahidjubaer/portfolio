import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { fadeVariants } from "../motion/motion-variants";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { ImageWithFallback } from "../../components/media/ImageWithFallback";
import { IconButton } from "../../components/ui/IconButton";
import { TextLink } from "../../components/ui/TextLink";
import { VisuallyHidden } from "../../components/ui/VisuallyHidden";
import { detectTextLanguage } from "../../lib/language";

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

/**
 * Accessible full-screen photograph viewer, built on the same focus-trap
 * pattern as MobileMenu (no `<dialog>` needed — a fixed-position panel
 * with a manual focus trap gives the same guarantees and matches the
 * existing codebase convention). Only mounted while a photograph is
 * selected; the caller is responsible for wrapping it in <AnimatePresence>.
 * @param {{
 *   photograph: { src: string, alt: string, title: string | null },
 *   onClose: () => void,
 *   onPrevious: () => void,
 *   onNext: () => void,
 *   hasPrevious: boolean,
 *   hasNext: boolean,
 * }} props
 */
export function PhotographyViewer({
  photograph,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) {
  const panelRef = useRef(null);

  useBodyScrollLock(true);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && hasPrevious) {
        onPrevious();
        return;
      }
      if (event.key === "ArrowRight" && hasNext) {
        onNext();
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

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={
        photograph.title
          ? `${photograph.title} — photograph viewer`
          : "Photograph viewer"
      }
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-(--z-overlay) flex items-center justify-center bg-black/85 p-4"
    >
      <IconButton
        label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 text-white hover:bg-white/10"
      >
        <X aria-hidden="true" size={20} />
      </IconButton>

      {hasPrevious ? (
        <IconButton
          label="Previous photograph"
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
        >
          <ChevronLeft aria-hidden="true" size={24} />
        </IconButton>
      ) : null}

      {hasNext ? (
        <IconButton
          label="Next photograph"
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
        >
          <ChevronRight aria-hidden="true" size={24} />
        </IconButton>
      ) : null}

      <figure className="flex max-h-full max-w-full flex-col items-center">
        <ImageWithFallback
          src={photograph.src}
          fallbackSrc="/assets/placeholders/photography-placeholder.svg"
          alt={photograph.alt}
          className="max-h-[80vh] max-w-full object-contain"
          loading="eager"
        />
        {photograph.title ? (
          <figcaption
            lang={detectTextLanguage(photograph.title)}
            className="body-sm mt-3 text-center text-white/80"
          >
            {photograph.title}
          </figcaption>
        ) : null}
        {photograph.postUrl ? (
          <TextLink
            href={photograph.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="body-sm mt-2 inline-flex items-center gap-1 text-white/60 hover:text-white"
          >
            View original post
            <ArrowUpRight aria-hidden="true" size={14} />
            <VisuallyHidden>(opens in a new tab, on Blogger)</VisuallyHidden>
          </TextLink>
        ) : null}
      </figure>
    </motion.div>
  );
}
