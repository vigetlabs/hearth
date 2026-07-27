import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";

import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";

export default function CalendarOfficeHeader() {
  const {
    activeOffice,
    changeOffice,
  } = useCalendarScope();

  return (
    <header className="flex items-center gap-3 pb-5">
      <h1 className="flex items-center gap-2 text-2xl font-bold capitalize text-fg">
        {activeOffice.name}

        <span aria-hidden="true">
          {activeOffice.emoji}
        </span>
      </h1>

      <OfficeSwitcher
        office={activeOffice}
        setOffice={changeOffice}
      />
    </header>
  );
}
