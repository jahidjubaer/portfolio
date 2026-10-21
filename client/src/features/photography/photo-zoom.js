import { flushSync } from "react-dom";

/*
 * The photo zoom: a view transition between a contact-sheet frame and
 * the viewer image. Both carry the same view-transition-name, but only
 * one at a time (a name must be unique on the page): the viewer image
 * holds it while open, and a frame gets it just for the transition.
 */

export const PHOTO_ZOOM = {
  viewTransitionName: "photo-zoom",
  viewTransitionClass: "photo-zoom",
};

// The viewer image is usually cached (same file as the thumbnail), but
// give it a moment to decode so the zoom doesn't land on a blank frame.
const DECODE_WAIT_MS = 300;

export function supportsPhotoZoom() {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function"
  );
}

function frameOf(photoId) {
  return document.querySelector(`[data-photo-id="${CSS.escape(photoId)}"]`);
}

function nameFrame(frame, named) {
  if (!frame) return;
  frame.style.viewTransitionName = named ? PHOTO_ZOOM.viewTransitionName : "";
  frame.style.viewTransitionClass = named ? PHOTO_ZOOM.viewTransitionClass : "";
}

function isOnScreen(element) {
  const box = element.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight;
}

async function viewerImageDecoded() {
  const image = document.querySelector("[data-photo-viewer] img");
  if (!image?.decode) return;
  await Promise.race([
    image.decode().catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, DECODE_WAIT_MS)),
  ]);
}

/**
 * Opens the viewer on `photoId`, zooming out of its frame.
 * @param {string} photoId
 * @param {() => void} open sets the state that mounts the viewer
 */
export function zoomOpen(photoId, open) {
  const frame = frameOf(photoId);
  nameFrame(frame, true);
  document.startViewTransition(async () => {
    nameFrame(frame, false);
    flushSync(open);
    await viewerImageDecoded();
  });
}

/**
 * Closes the viewer, zooming back into the frame of the photo it shows
 * (which may differ from the one opened, after Previous/Next). A frame
 * scrolled off screen isn't named, so the viewer just fades.
 * @param {string} photoId
 * @param {() => void} close sets the state that unmounts the viewer
 */
export function zoomClose(photoId, close) {
  const frame = frameOf(photoId);
  const target = frame && isOnScreen(frame) ? frame : null;
  const transition = document.startViewTransition(() => {
    nameFrame(target, true);
    flushSync(close);
  });
  transition.finished.finally(() => nameFrame(target, false));
}
