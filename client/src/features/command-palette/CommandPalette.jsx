import { lazy, Suspense, useEffect, useRef, useState } from "react";

const CommandPaletteDialog = lazy(() =>
  import("./CommandPaletteDialog").then((m) => ({
    default: m.CommandPaletteDialog,
  })),
);

function isEditableTarget(target) {
  if (!target || typeof target.tagName !== "string") return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable === true
  );
}

/**
 * Always-mounted shell: a single keydown listener for Ctrl/Cmd+K. The
 * actual dialog UI (CommandPaletteDialog, including its own AnimatePresence
 * exit animation) is only fetched — via React.lazy — the first time it's
 * opened, and stays mounted (toggled by the `open` prop) after that so its
 * exit animation keeps working on every later close.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(event) {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      // Never hijack the shortcut while the user is typing anywhere,
      // including inside the palette's own search field — Escape already
      // closes it, so this is never a dead end.
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      triggerRef.current = document.activeElement;
      setEverOpened(true);
      setOpen((current) => !current);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function close() {
    setOpen(false);
  }

  if (!everOpened) return null;

  return (
    <Suspense fallback={null}>
      <CommandPaletteDialog
        open={open}
        onClose={close}
        triggerRef={triggerRef}
      />
    </Suspense>
  );
}
