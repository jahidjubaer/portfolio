import { useEffect } from "react";

/**
 * Locks body scroll while `active` is true, restoring the previous
 * inline style on cleanup (covers both `active` flipping back to false
 * and the component unmounting while still active).
 * @param {boolean} active
 */
export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
