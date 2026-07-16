const OFFICES_KEY = "offices";

export function generateOfficesKey(): [string] {
  return [OFFICES_KEY];
}

export function generateOfficesUsersKey(
  officeId: number,
): [string, number, string] {
  return [OFFICES_KEY, officeId, "users"];
}
