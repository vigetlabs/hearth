import { getHealth } from "@/util/api/functions/health";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

export default function IndexPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });

  if (isLoading) return <div>Checking API...</div>;
  if (isError) return <div>API is down</div>;
  if (!data) return <div>No API status returned</div>;

  return (
    <div>
      <div>API status: {data.status}</div>
      <Link to="/users/signin" className="p-2">
        Sign in
      </Link>
      <Link to="/calendar" className="p-2">
        Calendar
      </Link>
    </div>
  );
}
