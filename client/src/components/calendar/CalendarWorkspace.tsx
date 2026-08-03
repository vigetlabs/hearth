import CalendarOfficeHeader from "@/components/calendar/layout/CalendarOfficeHeader";
import CalendarContainer from "@/components/calendar/layout/CalendarContainer";
import CalendarGrid from "@/components/calendar/layout/CalendarGrid";
import CalendarToolbar from "@/components/calendar/layout/CalendarToolbar";

export default function CalendarWorkspace() {

  return (
      <div className="relative mx-auto flex min-h-0 w-[90%] flex-1 flex-col pt-6 pb-8">
        <CalendarContainer>
          <CalendarOfficeHeader />

          <CalendarToolbar />

          <CalendarGrid />
        </CalendarContainer>
      </div>
  );
}
