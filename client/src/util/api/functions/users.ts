import { api } from "@/util/api/api";

import type { CreateUserRequest, UserResponse } from "@/types/api/users";

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
