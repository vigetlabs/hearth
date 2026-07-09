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

  const confirmClasses = destructive
    ? "bg-red-600 text-white hover:bg-red-700"
    : "bg-gray-900 text-white hover:bg-gray-800";

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-30 bg-black/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-40 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
          <AlertDialog.Title className="text-lg font-bold text-gray-900">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none">
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                confirmingRef.current = true;
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium focus:outline-none ${confirmClasses}`}
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
