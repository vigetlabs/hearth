import { RadioGroup } from "radix-ui";
import { useState } from "react";
import OfficeItem from "../OfficeItem/OfficeItem";
import type { Office } from "@/types/api/offices";

interface ShowHomeProps {
  offices: Office[];
  showRemoteOption: boolean;
  handleSelectOffice?: (newOfficeId: string) => void;
}

export default function OfficeOptions({
  offices,
  showRemoteOption,
  handleSelectOffice,
}: ShowHomeProps) {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");

  const visibleOfficeButtons = showRemoteOption
    ? offices
    : offices.filter(
        (office: Office) => office.name.toLowerCase() !== "remote",
      );

  function handleValueChange(newOfficeId: string) {
    setSelectedOfficeId(newOfficeId);
    handleSelectOffice?.(newOfficeId);
  }

  return (
    <RadioGroup.Root
      value={selectedOfficeId}
      onValueChange={handleValueChange}
      aria-label="Which office is your primary?"
      className=""
    >
      <div className="mt-5 grid grid-cols-4 gap-3">
        {visibleOfficeButtons.map((office: Office) => (
          <OfficeItem key={office.id} office={office} />
        ))}
      </div>
    </RadioGroup.Root>
  );
}
