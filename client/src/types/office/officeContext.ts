import type { Office } from "@/types/office/office";

export interface OfficeContext {
  /** The office currently being viewed on the calendar. */
  office: Office;
  /** Switch the active office. Held in memory only. */
  setOffice: (office: Office) => void;
}
