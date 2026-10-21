import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { OPEN_ASK_EVENT } from "./ask-events";

const AskDialog = lazy(() =>
  import("./AskDialog").then((m) => ({ default: m.AskDialog })),
);

/**
 * Always-mounted shell, like CommandPalette: listens for OPEN_ASK_EVENT and
 * only fetches the dialog the first time it opens. It stays mounted after
 * that (toggled by `open`), so the conversation survives closing and
 * reopening within a visit.
 */
export function AskJahid() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    function handleOpen() {
      triggerRef.current = document.activeElement;
      setEverOpened(true);
      setOpen(true);
    }
    window.addEventListener(OPEN_ASK_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_ASK_EVENT, handleOpen);
  }, []);

  if (!everOpened) return null;

  return (
    <Suspense fallback={null}>
      <AskDialog
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
      />
    </Suspense>
  );
}
