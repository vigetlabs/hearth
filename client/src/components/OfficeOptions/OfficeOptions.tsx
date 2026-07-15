import { RadioGroup } from "radix-ui";
import OfficeItem from "../OfficeItem/OfficeItem";
import type { Office } from "@/types/api/offices";

interface ShowHomeProps {
  offices: Office[];
  showRemoteOption: boolean;
  selectedOfficeId: string;
  handleSelectOffice?: (newOfficeId: string) => void;
}

export default function OfficeOptions({
  offices,
  showRemoteOption = false,
  selectedOfficeId,
  handleSelectOffice,
}: ShowHomeProps) {
  const visibleOfficeButtons = showRemoteOption
    ? offices
    : offices.filter(
        (office: Office) => office.name.toLowerCase() !== "remote",
      );

  return (
    <RadioGroup.Root
      value={selectedOfficeId}
      onValueChange={handleSelectOffice}
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
