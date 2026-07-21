const CURRENT_USER_KEY = "current-user";
const USERS_KEY = "users";

export function generateCurrentUserKey(): [string] {
  return [CURRENT_USER_KEY];
}

export function generateCurrentUserVisitsKey(
  date: string,
  view: string,
): [string, string, string] {
  return [CURRENT_USER_KEY, date, view];
}

export function generateUsersKey(): [string] {
  return [USERS_KEY];
}
