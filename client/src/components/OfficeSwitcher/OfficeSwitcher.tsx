import { Fragment } from "react";
import { DropdownMenu } from "radix-ui";

import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import type { Office } from "@/types/api/offices";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";

interface OfficeSwitcherProps {
  office: Office;
  setOffice: (office: Office) => void;
}

// A dropdown of the other offices, anchored below the "View offices" trigger.
// The open card is one row per office divided by hairlines. Switching here is
// for viewing another office's schedule — it doesn't change the user's default
// office.
export default function OfficeSwitcher({
  office,
  setOffice,
}: OfficeSwitcherProps) {
  const officesQuery = useOfficesQuery();
  const others = (officesQuery.data ?? []).filter(
    (option) =>
      option.id !== office.id && option.name.toLowerCase() !== "remote",
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-1 text-sm capitalize text-fg transition-colors hover:text-black focus:outline-none">
        view offices
        <ChevronDownIcon className="h-3 w-3" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-40 w-52 overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-black/5"
        >
          {others.map((option, index) => (
            <Fragment key={option.id}>
              {index > 0 && <DropdownMenu.Separator className="h-px bg-line" />}
              <DropdownMenu.Item
                onSelect={() => setOffice(option)}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-left outline-none transition-colors data-[highlighted]:bg-surface-muted"
              >
                <span className="text-lg" aria-hidden="true">
                  {option.emoji}
                </span>
                <span className="text-base font-semibold capitalize text-fg">
                  {option.name}
                </span>
              </DropdownMenu.Item>
            </Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
