/**
 * Events are stored keyed by `YYYY-MM-DD` (see `toDateKey`) so a cell can look
 * up its names in O(1). Each day holds zero or more names.
 */
export type EventsByDate = Record<string, string[]>;
