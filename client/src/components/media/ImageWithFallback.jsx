import { useState } from "react";
import { cn } from "../../lib/cn";

/**
 * Renders `src`, switching to `fallbackSrc` if it fails to load. Guards
 * against an infinite fallback loop if the fallback itself fails.
 * @param {{
 *   src: string,
 *   fallbackSrc: string,
 *   alt: string,
 *   className?: string,
 *   width?: number,
 *   height?: number,
 *   loading?: "eager" | "lazy",
 * }} props
 */
export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
}) {
  const [currentSrc, setCurrentSrc] = useState(src ?? fallbackSrc);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  function handleError() {
    if (currentSrc === fallbackSrc) {
      // The fallback itself failed to load — stop switching sources to
      // avoid an infinite error loop, but surface it during development.
      if (import.meta.env?.DEV && !fallbackFailed) {
        console.warn(
          `ImageWithFallback: fallback image also failed to load: ${fallbackSrc}`,
        );
      }
      setFallbackFailed(true);
      return;
    }

    if (import.meta.env?.DEV) {
      console.warn(
        `ImageWithFallback: "${src}" failed to load, using fallback "${fallbackSrc}".`,
      );
    }
    setCurrentSrc(fallbackSrc);
  }

  if (fallbackFailed) {
    return null;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(className)}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onError={handleError}
    />
  );
}
