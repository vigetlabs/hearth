import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu } from "radix-ui";

import { useAuth } from "@/util/auth/useAuth";
import { userDisplayName } from "@/util/auth/displayName";
import { useLogoutUserMutation } from "@/util/api/mutations/users/deleteLogoutMutation";
import { generateCurrentUserKey } from "@/util/api/keys/userKeys";

// The header is part of the authenticated shell: it renders on every page while
// a user is logged in and disappears entirely once they are not.
export default function Header() {
  const { user, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutUserMutation = useLogoutUserMutation();

  if (!isAuthenticated || !user) {
    return null;
  }

  function handleLogout() {
    logoutUserMutation.mutate(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: generateCurrentUserKey(),
        });
        navigate("/users/login");
      },
    });
  }

  const triggerLabel = userDisplayName(user);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gray-100" />
          <span className="text-lg font-bold text-gray-900">Hearth</span>
        </Link>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200 focus:outline-none">
            {triggerLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 4.5 6 7.5 9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-20 min-w-[240px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>

              <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />

              <DropdownMenu.Item
                onSelect={() => navigate("/users/profile")}
                className="cursor-pointer rounded-md px-3 py-2 text-sm text-gray-900 outline-none data-[highlighted]:bg-gray-100"
              >
                Profile &amp; Settings
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onSelect={handleLogout}
                className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
              >
                Log Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
