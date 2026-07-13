import { Fragment } from "react";
import { DropdownMenu } from "radix-ui";

import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { OFFICES } from "@/types/office/office";
import { useOffice } from "@/util/office/useOffice";

// A dropdown of the other offices, anchored below the "Switch office" trigger.
// Styled as a white rounded card with one row per office, divided by hairlines.
export default function OfficeSwitcher() {
  const { office, setOffice } = useOffice();
  const others = OFFICES.filter((option) => option.id !== office.id);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 focus:outline-none">
        Switch office
        <ChevronDownIcon className="h-3 w-3" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-40 w-64 rounded-[20px] bg-white p-2 shadow-xl ring-1 ring-black/5"
        >
          {others.map((option, i) => (
            <Fragment key={option.id}>
              {i > 0 && (
                <DropdownMenu.Separator className="mx-2 h-px bg-[#E6E6EA]" />
              )}
              <DropdownMenu.Item
                onSelect={() => setOffice(option)}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none data-[highlighted]:bg-gray-100"
              >
                <span className="text-lg" aria-hidden="true">
                  {option.emoji}
                </span>
                {option.name}
              </DropdownMenu.Item>
            </Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
