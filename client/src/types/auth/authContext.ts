import type { User } from "@/types/api/users";

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
}
