import { api } from "@/util/api/api";

import type {
  CreateUserRequest,
  UserResponse,
  LoginUserRequest,
} from "@/types/api/users";

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
