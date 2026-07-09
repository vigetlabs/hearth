import { AppAuthContext } from "@/util/auth/appAuthContext";
import { useCurrentUserQuery } from "@/util/api/queries/userQueries";
import Loader from "@/components/Loader/Loader";

import type { User } from "@/types/api/users";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const currentUserQuery = useCurrentUserQuery();

  if (currentUserQuery.isPending) {
    return <Loader />;
  }

  if (currentUserQuery.isError) {
    return <p>Failed to query currentUser</p>;
  }

  const user: User | null = currentUserQuery.data ?? null;
  const isAuthenticated = user !== null;

  return (
    <AppAuthContext.Provider
      value={{
        user,
        isAuthenticated,
      }}
    >
      {children}
    </AppAuthContext.Provider>
  );
}
