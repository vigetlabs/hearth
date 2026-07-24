import type { ReactNode } from "react";

import SmokeIcon from "@/components/icons/SmokeIcon";

interface ErrorScreenProps {
  title: string;
  description: string;
  // Optional call to action (e.g. a "Back home" button/link). Left to the
  // consumer so this stays presentational and unwired.
  action?: ReactNode;
}

// A friendly full-page fallback shown in place of the browser's raw error text
// when something goes wrong or a route isn't found. Purely presentational —
// callers supply the copy and any action. Leans on the app's "Hearth" campfire
// theme with a plume of smoke off a dead fire.
export default function ErrorScreen({
  title,
  description,
  action,
}: ErrorScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-page px-6 py-16 text-center">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl bg-surface px-8 py-12 shadow-card">
        <SmokeIcon className="h-24 w-24 text-fg-subtle" />

        <h1 className="mt-8 text-2xl font-bold text-fg">{title}</h1>

        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          {description}
        </p>

        {action && <div className="mt-8">{action}</div>}
      </div>
    </div>
  );
}
