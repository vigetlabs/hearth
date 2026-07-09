import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import { useLogoutUserMutation } from "@/util/api/mutations/users/deleteLogoutMutation";
import { useAuth } from "@/util/auth/useAuth";
import { generateCurrentUserKey } from "@/util/api/keys/userKeys";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logoutUserMutation = useLogoutUserMutation();

  function handleLogout(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    logoutUserMutation.mutate(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: generateCurrentUserKey(),
        });
        navigate("/users/login");
      },
    });
  }

  return (
    <div>
      <div>{user?.email}</div>
      <div>Authenticated: {String(isAuthenticated)}</div>
      <button onClick={handleLogout}>
        {logoutUserMutation.isPending ? "Logging out..." : "Log out"}
      </button>
    </div>
  );
}
