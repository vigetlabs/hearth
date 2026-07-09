import { useAuth } from "@/util/auth/useAuth";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      <div>{user?.email}</div>
      <div>Authenticated: {String(isAuthenticated)}</div>
    </div>
  );
}
