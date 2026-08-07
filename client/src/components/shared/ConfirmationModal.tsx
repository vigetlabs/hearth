import { useRef } from "react";
import { AlertDialog } from "radix-ui";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  // When true the confirm button is styled as a destructive action.
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// A controlled confirmation dialog built on Radix AlertDialog: focus is trapped,
// Escape resolves to cancel, and the cancel button takes initial focus so the
// safe choice is always the default.
export default function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  // Every close funnels through onOpenChange. This ref records whether that
  // close came from the confirm button so we can route it to the right handler
  // (and so pressing Escape or dismissing still counts as a cancel).
  const confirmingRef = useRef(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      return;
    }

    if (confirmingRef.current) {
      confirmingRef.current = false;
      onConfirm();
    } else {
      onCancel();
    }
  }

  // Only the confirm button changes with destructive: it reads as a destructive
  // action when destructive, and as the softer/secondary choice otherwise.
  const confirmClasses = destructive
    ? "bg-danger text-fg-inverse hover:bg-danger-hover"
    : "border border-line-strong bg-surface text-fg hover:bg-surface-sunken";

  // The cancel button style is fixed and never changes with destructive.
  const cancelClasses = "bg-surface-muted hover:bg-surface-strong";

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 z-30 bg-white/70"
          onClick={onCancel}
        />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-40 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-xl focus:outline-none">
          <AlertDialog.Title className="text-center text-xl font-bold text-fg">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-center text-base text-fg-muted">
            {description}
          </AlertDialog.Description>

          <div className="mt-8 flex justify-center gap-3">
            <AlertDialog.Cancel
              className={`rounded-lg border border-line-strong px-4 py-2 text-sm font-medium text-fg transition-colors focus:outline-none ${cancelClasses}`}
            >
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                confirmingRef.current = true;
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${confirmClasses}`}
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
