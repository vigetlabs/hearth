import ErrorScreen from "@/components/ErrorScreen/ErrorScreen";

// Generic catch-all fallback for unexpected failures (a thrown render error,
// a failed load, etc.) shown instead of the raw error text. Not yet wired into
// the router / error boundary — see SandboxPage for a preview.
export default function ErrorPage() {
  return (
    <ErrorScreen
      title="Something went wrong"
      description="Something went up in smoke on our end. Try again in a moment — if it keeps happening, let us know."
      action={
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-strong px-4 py-2 text-sm font-medium text-fg-inverse transition-colors hover:bg-strong-hover"
        >
          Try again
        </button>
      }
    />
  );
}
