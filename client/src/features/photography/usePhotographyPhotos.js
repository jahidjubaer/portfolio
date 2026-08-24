import { useEffect, useState } from "react";
import { getPhotographyPhotos } from "../../lib/api";
import { photographs as localPhotographs } from "../../data/photography";

/**
 * @param {import("../../lib/api").BlogPhoto} photo
 * @returns {{ id: string, src: string, thumbnail: string, title: string, category: string, alt: string, postUrl: string }}
 */
function toGalleryPhotograph(photo) {
  return {
    id: photo.id,
    src: photo.src,
    thumbnail: photo.thumbnail,
    // The resolved editorial caption (explicit caption > alt > post title)
    // is the most useful single line to show in the viewer — richer than
    // the bare post title alone.
    title: photo.caption,
    category: photo.category,
    alt: photo.alt,
    postUrl: photo.postUrl,
  };
}

/**
 * Priority order for what the Beyond photography gallery actually shows:
 * real Blogger photographs first, local asset-manifest photographs as a
 * fallback, and only then an honest empty/error state — never a mix that
 * could show the same photo twice from two sources.
 * @returns {{
 *   status: "loading" | "loaded" | "error",
 *   photographs: Array<object>,
 *   source: "blogger" | "local" | "none",
 *   message: string,
 *   retry: () => void,
 * }}
 */
export function usePhotographyPhotos() {
  const [state, setState] = useState({
    status: "loading",
    photographs: [],
    source: "none",
    message: "",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, status: "loading" }));

    getPhotographyPhotos().then((result) => {
      if (cancelled) return;

      if (
        result.success &&
        result.configured !== false &&
        result.photos?.length
      ) {
        setState({
          status: "loaded",
          photographs: result.photos.map(toGalleryPhotograph),
          source: "blogger",
          message: "",
        });
        return;
      }

      if (localPhotographs.length > 0) {
        setState({
          status: "loaded",
          photographs: localPhotographs,
          source: "local",
          message: "",
        });
        return;
      }

      if (!result.success) {
        setState({
          status: "error",
          photographs: [],
          source: "none",
          message:
            result.message || "Photography couldn't be loaded right now.",
        });
        return;
      }

      // Reachable and configured (or intentionally unconfigured), just
      // nothing to show yet — an empty gallery, not a failure.
      setState({
        status: "loaded",
        photographs: [],
        source: "none",
        message: "",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function retry() {
    setAttempt((current) => current + 1);
  }

  return { ...state, retry };
}
