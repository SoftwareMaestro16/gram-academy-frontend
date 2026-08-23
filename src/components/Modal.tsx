import { useEffect, type ReactNode } from "react";

/** Centered modal overlay — backdrop click or Escape closes it, matching this
 *  app's other dismiss-by-outside-tap surfaces (e.g. `WalletControl`'s
 *  popover). Renders nothing when `open` is false. */
export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="elev max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
