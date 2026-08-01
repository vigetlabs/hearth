import { createContext } from "react";
import type { User } from "@/types/api/users";

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
}

export const AppAuthContext = createContext<AuthContext | null>(null);
