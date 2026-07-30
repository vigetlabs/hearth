/**
 * Fitting the two in-office roster sections into a day column that can't grow.
 *
 * The calendar gives every day the same fixed height, so when "Confirmed In"
 * and "Planning to Come In" together ask for more room than there is, they
 * share what's available instead of one pushing the other out of sight: the
 * section asking for less is satisfied first and hands its surplus to the
 * other. Two people planning to come in stay visible next to ten confirmed.
 *
 * Whatever doesn't fit is summarised by a "+N more" chip, which costs a row of
 * its own — so a truncated section pays for its own chip out of its budget.
 */

/** Pixel cost of each piece of a section. Every value tracks a Tailwind class
    in `DayRoster`; change one there and change it here. */
export interface RosterMetrics {
  /** One name row: `py-1.5` (12px) around a 20px line. */
  rowHeight: number;
  /** Section title plus its `mb-1.5`: a 16px line + 6px. */
  headerHeight: number;
  /** "+N more" chip plus its `mt-1.5`: a 24px pill + 6px. */
  chipHeight: number;
  /** `space-y-4` between the two sections. */
  sectionGap: number;
}

export const ROSTER_METRICS: RosterMetrics = {
  rowHeight: 32,
  headerHeight: 22,
  chipHeight: 30,
  sectionGap: 16,
};

/** How much of one section is rendered, and how much the chip has to cover. */
export interface SectionFit {
  shown: number;
  hidden: number;
}

export interface RosterFit {
  confirmed: SectionFit;
  planning: SectionFit;
}

export interface RosterCounts {
  confirmed: number;
  planning: number;
}

/** Everything fits — the fallback for before the column has been measured. */
export const untruncated = (counts: RosterCounts): RosterFit => ({
  confirmed: { shown: counts.confirmed, hidden: 0 },
  planning: { shown: counts.planning, hidden: 0 },
});

/**
 * Decides how many names each in-office section may render inside
 * `availableHeight` pixels.
 */
export function fitRoster(
  counts: RosterCounts,
  availableHeight: number,
  metrics: RosterMetrics = ROSTER_METRICS,
): RosterFit {
  const wants = [counts.confirmed, counts.planning];

  if (wants[0] + wants[1] === 0) {
    return untruncated(counts);
  }

  // Rows left for names once the headers, the gap, and any chips are paid for.
  // An empty section isn't rendered at all, so it costs nothing.
  function budgetFor(chips: boolean[]): number {
    let overhead = wants[0] > 0 && wants[1] > 0 ? metrics.sectionGap : 0;

    wants.forEach((want, index) => {
      if (want === 0) return;
      overhead += metrics.headerHeight;
      if (chips[index]) overhead += metrics.chipHeight;
    });

    return Math.max(
      0,
      Math.floor((availableHeight - overhead) / metrics.rowHeight),
    );
  }

  // Reserving a chip shrinks the budget, which can only ever truncate more —
  // never less — so this settles after at most one flip per section.
  let chips = [false, false];
  let shown = wants.slice();

  for (let pass = 0; pass < 4; pass += 1) {
    shown = distribute(wants, budgetFor(chips));

    const nextChips = wants.map((want, index) => shown[index] < want);
    if (nextChips[0] === chips[0] && nextChips[1] === chips[1]) break;

    chips = nextChips;
  }

  return {
    confirmed: sectionFit(wants[0], shown[0]),
    planning: sectionFit(wants[1], shown[1]),
  };
}

const sectionFit = (want: number, shown: number): SectionFit => ({
  shown,
  hidden: Math.max(0, want - shown),
});

/** Hands out `budget` name rows, then applies the one-name floor. */
function distribute(wants: number[], budget: number): number[] {
  const shown = fairShare(wants, budget);

  // A section that's rendered at all shows at least one name — a lone chip
  // standing in for a single person tells you less than the person's name
  // does. It borrows the row from the other section, which keeps its own name.
  // If neither section can spare a row the column overflows by one; that only
  // happens in a day cell too short for two names, which the calendar's own
  // minimum height rules out.
  [0, 1].forEach((index) => {
    if (wants[index] === 0 || shown[index] > 0) return;

    shown[index] = 1;
    const other = index === 0 ? 1 : 0;
    if (shown[other] > 1) shown[other] -= 1;
  });

  return shown;
}

/**
 * Max-min fair share: satisfy the smallest ask first, then split what's left
 * between the sections still asking. A section wanting less than its even
 * share takes only what it needs and the surplus flows to the other one.
 */
function fairShare(wants: number[], capacity: number): number[] {
  const shown = wants.map(() => 0);
  // Served in order, so whoever comes last picks up the rows that don't divide
  // evenly. Ties go to the later index first, which leaves the odd row with
  // Confirmed In — the more definite of the two lists.
  const smallestAskFirst = wants
    .map((_, index) => index)
    .sort((a, b) => wants[a] - wants[b] || b - a);

  let remaining = capacity;
  let claimants = smallestAskFirst.length;

  smallestAskFirst.forEach((index) => {
    const take = Math.min(wants[index], Math.floor(remaining / claimants));

    shown[index] = take;
    remaining -= take;
    claimants -= 1;
  });

  return shown;
}
