import { createContext } from "react";

import type { OfficeContext } from "@/types/office/officeContext";

export const AppOfficeContext = createContext<OfficeContext | null>(null);
