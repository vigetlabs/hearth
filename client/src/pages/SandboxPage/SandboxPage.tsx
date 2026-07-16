import { useState } from "react";
import { RadioGroup } from "radix-ui";

import Loader from "@/components/Loader/Loader";
import OfficeItem from "@/components/OfficeItem/OfficeItem";
import OfficeSwitcherMenu from "@/components/OfficeSwitcherMenu/OfficeSwitcherMenu";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import {
  StatusIcon,
  type StatusMark,
  type StatusVariant,
} from "@/components/Calendar/StatusIcon";
import type { Office } from "@/types/api/offices";

// A dev-only gallery for eyeballing components in isolation. Add a <Demo> block
// per component/state you want to see. This page is only mounted in dev (see the
// route in routes/router.ts), so it never ships to production.

function Demo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-8">
      <h2 className="mb-4 font-mono text-sm text-fg-muted">{title}</h2>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </section>
  );
}

const SAMPLE_OFFICES: Office[] = [
  { id: 1, name: "Falls Church", emoji: "🏢" } as Office,
  { id: 2, name: "Durham", emoji: "🌳" } as Office,
  { id: 3, name: "Remote", emoji: "🏠" } as Office,
];

const STATUS_MARKS: StatusMark[] = [
  "confirmed-yes",
  "planning-yes",
  "planning-no",
  "confirmed-no",
  "add",
];

const STATUS_VARIANTS: StatusVariant[] = ["outline", "solid", "dashed"];

export default function SandboxPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenWarning, setModalOpenWarning] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-fg">Component Sandbox</h1>
      <p className="mb-8 text-sm text-fg-muted">
        Dev-only. Drop components here to see them without wiring up real data.
      </p>

      <Demo title="Loader">
        <Loader />
        <Loader size="h-8 w-8" />
        <Loader size="h-12 w-12" />
      </Demo>

      <Demo title="StatusIcon — marks × variants (size lg)">
        {STATUS_VARIANTS.map((variant) => (
          <div key={variant} className="flex items-center gap-3">
            <span className="w-16 font-mono text-xs text-fg-muted">
              {variant}
            </span>
            {STATUS_MARKS.map((mark) => (
              <StatusIcon key={mark} mark={mark} variant={variant} size="lg" />
            ))}
          </div>
        ))}
      </Demo>

      <Demo title="OfficeItem (inside a RadioGroup)">
        <RadioGroup.Root className="grid w-full max-w-md grid-cols-3 gap-4">
          {SAMPLE_OFFICES.map((office) => (
            <OfficeItem key={office.id} office={office} className="" />
          ))}
        </RadioGroup.Root>
      </Demo>

      <Demo title="OfficeSwitcherMenu">
        <OfficeSwitcherMenu
          offices={SAMPLE_OFFICES}
          onSelect={(office) => console.log("switch to", office.name)}
        />
      </Demo>

      <Demo title="ConfirmationModal">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-strong px-4 py-2 text-sm font-medium text-fg-inverse hover:bg-strong-hover"
        >
          Open modal
        </button>
        <ConfirmationModal
          open={modalOpen}
          title="Your default office is Boulder"
          description="Are you sure you want to schedule an in-person visit to Falls Church?"
          confirmLabel="Yes"
          cancelLabel="Go back"
          onConfirm={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        />
        <button
          type="button"
          onClick={() => setModalOpenWarning(true)}
          className="rounded-lg bg-strong px-4 py-2 text-sm font-medium text-fg-inverse hover:bg-strong-hover"
        >
          Open modal (warning style/destructive action)
        </button>
        <ConfirmationModal
          open={modalOpenWarning}
          title="Your default office is Boulder"
          description="Are you sure you want to schedule an in-person visit to Falls Church?"
          confirmLabel="Yes"
          cancelLabel="Go back"
          destructive
          onConfirm={() => setModalOpenWarning(false)}
          onCancel={() => setModalOpenWarning(false)}
        />
      </Demo>
    </div>
  );
}
