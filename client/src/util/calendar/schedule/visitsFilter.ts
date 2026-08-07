import type { Visit } from "@/types/api/visits";

export function findUserVisitsOnDate(
  dateKey: string,
  userId: number,
  visits: Visit[],
): Visit[] {
  return visits.filter(
    (visit) => visit.user.id === userId && visit.visit_date === dateKey,
  );
}

export function hasVisitAtOffice(
  userVisitsOnDate: Visit[],
  activeOfficeId: number,
): boolean {
  return userVisitsOnDate.some((visit) => visit.office_id === activeOfficeId);
}

export function hasExternalVisit(
  userVisitsOnDate: Visit[],
  activeOfficeId: number,
): boolean {
  return userVisitsOnDate.some((visit) => visit.office_id !== activeOfficeId);
}
