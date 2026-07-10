import { useNavigate } from "react-router";
import { useState } from "react";

import { RadioGroup } from "radix-ui";

import { OFFICES } from "@/types/office/office";

export default function OfficePicker() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");

  const navigate = useNavigate();

  function handleContinue() {
    if (!selectedOfficeId) return;

    // @TODO: Persist the selected default office to the API.
    const selectedOffice = OFFICES.find(
      (office) => office.id === selectedOfficeId,
    );

    // Remote users have no in-office days to pick, so skip the schedule screen
    // and drop them straight into the calendar.
    if (selectedOffice?.id === "remote") {
      navigate("/calendar");
      return;
    }

    // Otherwise advance to the schedule screen, passing the office along so it
    // can tailor its heading.
    navigate("/users/schedule", { state: { office: selectedOffice } });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 pt-32">
      <h1 className="text-4xl font-bold text-fg-primary">Pick your office</h1>
      <p className="mt-4 text-lg text-neutral-500">
        Based on it we'll show you who's around each day, so you can time your
        visit right.
      </p>

      <div className="mt-14 w-full">
        <RadioGroup.Root
          value={selectedOfficeId}
          onValueChange={setSelectedOfficeId}
          aria-label="Which office do you go to?"
        >
          <p className="mb-4 font-semibold text-fg-primary">
            Which office do you go to?
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {OFFICES.map((office) => (
              <RadioGroup.Item
                key={office.id}
                value={office.id}
                className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border text-fg-primary transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none data-[state=checked]:border-neutral-500 data-[state=checked]:bg-neutral-100 ${
                  office.dashed ? "border-dashed" : "border-solid"
                } border-neutral-200`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {office.emoji}
                </span>
                <span className="font-medium">{office.name}</span>
              </RadioGroup.Item>
            ))}
          </div>
        </RadioGroup.Root>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!selectedOfficeId}
        className="mt-12 w-full rounded-full bg-neutral-500 py-4 text-lg font-semibold text-white transition-colors enabled:hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continue
      </button>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-6 flex items-center gap-1 font-semibold text-neutral-500 hover:text-fg-primary"
      >
        <span aria-hidden="true">‹</span> Go back
      </button>
    </div>
  );
}
