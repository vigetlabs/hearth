import { Link } from "react-router";

import ErrorScreen from "@/components/feedback/ErrorScreen";

// Shown when a user lands on a route that doesn't exist (404). Not yet wired
// into the router — see SandboxPage for a preview.
export default function NotFoundPage() {
  return (
    <ErrorScreen
      title="Nothing to see here"
      description="This page doesnt exist. Check the address, or head back to warmer ground."
      action={
        <Link
          to="/"
          className="rounded-lg bg-strong px-4 py-2 text-sm font-medium text-fg-inverse transition-colors hover:bg-strong-hover"
        >
          Back home
        </Link>
      }
    />
  );
}
