import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";
import { useCalendarScope } from "@/hooks/useCalendarScope";
import type { Office } from "@/types/api/offices";

export default function CalendarOfficeHeader() {
  const scope = useCalendarScope();

  function handleOfficeChange(office: Office) {
    scope.changeOffice(office);
  }

  return (
    <div className="flex items-center gap-3 pb-5">
      <h2 className="flex items-center gap-2 text-2xl font-bold capitalize text-fg">
        {scope.activeOffice.name}

        <span aria-hidden="true">{scope.activeOffice.emoji}</span>
      </h2>

      <OfficeSwitcher
        office={scope.activeOffice}
        setOffice={handleOfficeChange}
      />
    </div>
  );
}
