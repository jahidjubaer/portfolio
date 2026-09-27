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
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      triggerRef.current = document.activeElement;
      setEverOpened(true);
      setOpen((current) => !current);
    }

    function handleOpenEvent() {
      triggerRef.current = document.activeElement;
      setEverOpened(true);
      setOpen(true);
    }

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
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
