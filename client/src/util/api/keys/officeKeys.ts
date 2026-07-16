const OFFICES_KEY = "offices";

export function generateOfficesKey(): [string] {
  return [OFFICES_KEY];
}

export function generateOfficesUsersKey(): [string, string] {
  return [OFFICES_KEY, "users"];
}
