import { api } from "@/util/api/api";

import type {
  CreateUserRequest,
  UserResponse,
  LoginUserRequest,
  PatchUserRequest,
  UsersResponse,
} from "@/types/api/users";

import type { EmptySuccessResponse } from "@/types/api/generics";
import type { ScheduleAttributes } from "@/types/api/schedules";

export function createUserObjectPayload(
  email: string,
  first_name: string,
  last_name: string,
  password: string,
): CreateUserRequest {
  return {
    user: {
      email,
      first_name,
      last_name,
      password,
      password_confirmation: password,
    },
  };
}

export async function createUser(
  payload: CreateUserRequest,
): Promise<UserResponse> {
  const response = await api
    .post("/users", {
      json: payload,
    })
    .json<UserResponse>();

  return response;
}

export function createUserLoginObjectPayload(
  email: string,
  password: string,
): LoginUserRequest {
  return {
    user: {
      email,
      password,
    },
  };
}

export async function loginUser(
  payload: LoginUserRequest,
): Promise<UserResponse> {
  const response = await api
    .post("/users/login", {
      json: payload,
    })
    .json<UserResponse>();

  return response;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await api.get("/users/me").json<UserResponse>();

  return response;
}

export async function getUsers(office_id: number): Promise<UsersResponse> {
  const response = await api
    .get("/users", {
      searchParams: {
        office_id,
      },
    })
    .json<UsersResponse>();

  return response;
}

// The roster endpoint isn't built on the API yet, so this resolves the mock in
// the real response shape. Swapping in `api.get("/users").json<...>()` later
// touches nothing outside this function.
// export async function getUsers(): Promise<MockUsersResponse> {
//   return Promise.resolve(mockUsersResponse);
// }

export async function logoutUser(): Promise<EmptySuccessResponse> {
  const response = await api
    .delete("/users/logout")
    .json<EmptySuccessResponse>();

  return response;
}

export function createUpdateUserObjectPayload(
  first_name?: string,
  last_name?: string,
  office_id?: number,
  default_schedule?: ScheduleAttributes,
): PatchUserRequest {
  return {
    user: {
      first_name,
      last_name,
      office_id,
      default_schedule,
    },
  };
}

export async function updateUser(
  payload: PatchUserRequest,
): Promise<UserResponse> {
  const response = await api
    .patch("/users/me", {
      json: payload,
    })
    .json<UserResponse>();

  return response;
}
