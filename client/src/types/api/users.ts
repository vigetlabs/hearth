import type { components } from "@/types/api/openapi-schemas";

export type User = components["schemas"]["user"];

export type LoginUserRequest = components["schemas"]["login_user_request"];

export type CreateUserRequest = components["schemas"]["create_user_request"];

export type PatchUserRequest = components["schemas"]["patch_user_request"];

export type UserResponse = components["schemas"]["user_response"];

export type UsersResponse = components["schemas"]["users_response"];
