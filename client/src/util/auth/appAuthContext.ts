import { createContext } from "react";

import type { AuthContext } from "@/types/auth/authContext";

export const AppAuthContext = createContext<AuthContext | null>(null);
