import { useState } from "react";

import { AppOfficeContext } from "@/util/office/appOfficeContext";
import { useAuth } from "@/util/auth/useAuth";
import { OFFICES, type Office } from "@/types/office/office";

interface OfficeProviderProps {
  children: React.ReactNode;
}

// Holds the office the user is currently viewing. It lives in memory only, so it
// survives client-side navigation but resets on a full page refresh — and we
// clear it back to the default when the user logs out.
export default function OfficeProvider({ children }: OfficeProviderProps) {
  const { isAuthenticated } = useAuth();
  const [office, setOffice] = useState<Office>(OFFICES[0]);

  // Reset the in-memory selection the moment auth flips to logged-out. Adjusting
  // state during render (rather than in an effect) is React's recommended way to
  // respond to a changed value without an extra render pass.
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);
  if (wasAuthenticated !== isAuthenticated) {
    setWasAuthenticated(isAuthenticated);
    if (!isAuthenticated) {
      setOffice(OFFICES[0]);
    }
  }

  return (
    <AppOfficeContext.Provider value={{ office, setOffice }}>
      {children}
    </AppOfficeContext.Provider>
  );
}
