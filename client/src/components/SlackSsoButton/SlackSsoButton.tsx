import { redirectToSlackSso } from "@/util/auth/redirectToSlackSso";
import { cn } from "@/util/cn";

interface SlackSsoButtonProps {
  className?: string;
}

export default function SlackSsoButton({ className }: SlackSsoButtonProps) {
  return (
    <button
      type="button"
      onClick={redirectToSlackSso}
      className={cn(
        "bg-red-500",
        className
      )}
    >
      Continue with Slack
    </button>
  )
}
