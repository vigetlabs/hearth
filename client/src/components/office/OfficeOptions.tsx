import { RadioGroup } from "radix-ui";
import OfficeItem from "./OfficeItem";
import type { Office } from "@/types/api/offices";
import { cn } from "@/util/cn";

interface OfficeOptionsProps {
  offices: Office[];
  showRemoteOption: boolean;
  selectedOfficeId: string;
  handleSelectOffice?: (newOfficeId: string) => void;
  officeItemClassName?: string;
  containerClassName?: string;
}

export default function OfficeOptions({
  offices,
  showRemoteOption = false,
  selectedOfficeId,
  handleSelectOffice,
  officeItemClassName,
  containerClassName,
}: OfficeOptionsProps) {
  const visibleOfficeButtons = showRemoteOption
    ? offices
    : offices.filter(
        (office: Office) => office.name.toLowerCase() !== "remote",
      );

  const officeClasses = cn(
    "mt-5 grid gap-3",
    showRemoteOption ? "grid-cols-5" : "grid-cols-4",
    containerClassName,
  );

  return (
    <RadioGroup.Root
      value={selectedOfficeId}
      onValueChange={handleSelectOffice}
      aria-label="Which office is your primary?"
    >
      <div className={officeClasses}>
        {visibleOfficeButtons.map((office: Office) => (
          <OfficeItem
            key={office.id}
            office={office}
            className={officeItemClassName}
          />
        ))}
      </div>
    </RadioGroup.Root>
  );
}
