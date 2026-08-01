interface CalendarContainer {
  children: React.ReactNode;
}

export default function CalendarContainer({ children }: CalendarContainer) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface p-6 shadow-card">
      {children}
    </div>
  );
}
