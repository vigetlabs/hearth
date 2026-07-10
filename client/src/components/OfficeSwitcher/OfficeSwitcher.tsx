import { useState } from "react";
import { Dialog } from "radix-ui";

import CheckIcon from "@/components/icons/CheckIcon";
import { OFFICES, type Office } from "@/types/office/office";
import { useOffice } from "@/util/office/useOffice";

// Opens a modal for choosing which office's schedule to view. Styled after the
// account panel in the header: a white rounded card with selectable rows.
export default function OfficeSwitcher() {
  const { office, setOffice } = useOffice();
  const [open, setOpen] = useState(false);

  function handleSelect(next: Office) {
    setOffice(next);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none">
        Switch office
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-40 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl focus:outline-none">
          <Dialog.Title className="px-2 text-lg font-bold text-gray-900">
            Switch office
          </Dialog.Title>
          <Dialog.Description className="mt-1 px-2 text-sm text-gray-400">
            Choose which office's schedule to view.
          </Dialog.Description>

          <div className="mt-3 flex flex-col gap-0.5">
            {OFFICES.map((option) => {
              const isActive = option.id === office.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`flex items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm outline-none ${
                    isActive
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">
                    {option.emoji}
                  </span>
                  {option.name}
                  {isActive && (
                    <CheckIcon className="ml-auto h-4 w-4 text-gray-900" />
                  )}
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
