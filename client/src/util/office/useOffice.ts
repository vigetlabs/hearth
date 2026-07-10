import { useContext } from "react";

import { AppOfficeContext } from "@/util/office/appOfficeContext";

export function useOffice() {
  const context = useContext(AppOfficeContext);

  if (!context) {
    throw new Error("useOffice must be used inside an OfficeProvider");
  }
  return context;
}
