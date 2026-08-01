import "@/pages/CalendarPage/CalendarPageSkeleton.css";

const WEEKDAYS_PER_WEEK = 5;

// The placeholder-block class, scoped to this component via the co-located CSS.
const BLOCK = "calendar-skeleton-block";

// Each column gets its own roster shape so the skeleton doesn't read as a
// mechanical repeat. Widths are percentages of the name column; the counts and
// the split between the two labelled sections vary per day.
const COLUMN_SHAPES: ColumnShape[] = [
  { sections: [{ rows: [72, 55, 63] }, { rows: [48, 60] }] },
  { sections: [{ rows: [60, 68] }, { rows: [52] }] },
  { sections: [{ rows: [66, 50, 74, 58] }, { rows: [62, 45] }] },
  { sections: [{ rows: [58, 70] }] },
  { sections: [{ rows: [64, 52, 60] }, { rows: [56, 68, 47] }] },
];

interface ColumnShape {
  sections: { rows: number[] }[];
}

/** Full-page loading state for the calendar. Reproduces the page card and its
    header/nav chrome plus the five-column calendar grid, with every piece of
    text or icon replaced by a shimmering placeholder block, so the real page
    fades in over the same layout instead of popping in around a spinner. */
export default function CalendarPageSkeleton() {
  return (
    <div
      className="relative flex flex-1 flex-col overflow-hidden bg-page"
      aria-busy="true"
      aria-label="Loading calendar"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_top_left,rgba(180,72,32,0.14),transparent),radial-gradient(60%_60%_at_right_82%,rgba(180,72,32,0.14),transparent)]"
      />

      <div className="relative mx-auto flex min-h-0 w-[90%] flex-1 flex-col py-8">
        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface p-6 shadow-card">
          {/* Office title + switcher */}
          <div className="flex items-center gap-3 pb-5">
            <div className={`${BLOCK} h-8 w-40 rounded-lg`} />
            <div className={`${BLOCK} h-8 w-8 rounded-full`} />
          </div>

          {/* Week nav + status + confirm button */}
          <div className="flex items-center gap-4 pb-5">
            <div className={`${BLOCK} h-10 w-52 rounded-full`} />
            <div className={`${BLOCK} h-4 w-64 rounded`} />
            <div className={`${BLOCK} ml-auto h-11 w-36 rounded-full`} />
          </div>

          <CalendarGridSkeleton />
        </div>
      </div>
    </div>
  );
}

/** The five-column grid, matching the real calendar's container so the columns
    and dividers line up exactly. */
function CalendarGridSkeleton() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="grid min-h-0 flex-1 divide-x-2 divide-line overflow-hidden rounded-xl border-2 border-line"
        style={{
          gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
          gridTemplateRows: "1fr",
        }}
      >
        {COLUMN_SHAPES.map((shape, index) => (
          <DayCellSkeleton key={index} shape={shape} />
        ))}
      </div>
    </div>
  );
}

function DayCellSkeleton({ shape }: { shape: ColumnShape }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DayHeaderSkeleton />
      <DayRosterSkeleton shape={shape} />
    </div>
  );
}

/** Mirrors `DayHeader`'s geometry: date label, status circle, and the two
    fixed-height badge slots beneath. */
function DayHeaderSkeleton() {
  return (
    <div className="relative w-full shrink-0 border-b border-line bg-surface px-4 pb-3 pt-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className={`${BLOCK} h-5 w-10 rounded`} />
          <div className={`${BLOCK} h-3 w-5 rounded`} />
        </div>
        <div className={`${BLOCK} h-8 w-8 rounded-full`} />
      </div>

      <div className="mt-2 flex flex-col items-start gap-2">
        <div className="flex h-5 items-center">
          <div className={`${BLOCK} h-4 w-16 rounded-full`} />
        </div>
        <div className="flex h-5 items-center" />
      </div>
    </div>
  );
}

/** Mirrors `DayRoster`: the pill tab toggle, then labelled sections of
    icon-plus-name rows. */
function DayRosterSkeleton({ shape }: { shape: ColumnShape }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
      <div className={`${BLOCK} mx-auto mb-4 h-7 w-36 rounded-full`} />

      <div className="space-y-4">
        {shape.sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className={`${BLOCK} mb-2 h-3 w-24 rounded`} />
            <ul className="space-y-3">
              {section.rows.map((width, rowIndex) => (
                <li key={rowIndex} className="flex items-center gap-2">
                  <div className={`${BLOCK} h-4 w-4 shrink-0 rounded-full`} />
                  <div
                    className={`${BLOCK} h-4 rounded`}
                    style={{ width: `${width}%` }}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
