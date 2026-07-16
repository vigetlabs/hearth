import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu } from "radix-ui";

import Logo from "@/components/Logo/Logo";

import { useAuth } from "@/util/auth/useAuth";
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
        navigate("/users/signin");
      },
    });
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <span className="text-lg font-bold text-fg">Hearth</span>
        </Link>

        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-fg">
            Welcome back, {user.first_name}
          </span>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-sm font-semibold text-fg hover:bg-surface-strong focus:outline-none">
              Profile
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
                className="z-20 min-w-[240px] rounded-xl border border-line bg-surface p-1.5 shadow-lg"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-fg">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-fg-faint">{user.email}</p>
                </div>

                <DropdownMenu.Separator className="my-1 h-px bg-surface-muted" />

                <DropdownMenu.Item
                  onSelect={() => navigate("/users/profile")}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm text-fg outline-none data-[highlighted]:bg-surface-muted"
                >
                  Profile &amp; Settings
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={handleLogout}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm text-danger outline-none data-[highlighted]:bg-danger-surface"
                >
                  Log Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
