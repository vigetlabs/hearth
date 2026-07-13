import { useState } from "react";
import { useNavigate } from "react-router";

import { useQueryClient } from "@tanstack/react-query";
import { RadioGroup } from "radix-ui";

import OfficeItem from "@/components//OfficeItem/OfficeItem";
import type { PatchUserRequest } from "@/types/api/users";
import { createUpdateUserObjectPayload } from "@/util/api/functions/users";
import { generateCurrentUserKey } from "@/util/api/keys/userKeys";
import { useUpdateUserMutation } from "@/util/api/mutations/users/updateUserMutation";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";

export default function OfficePicker() {
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const officesQuery = useOfficesQuery();
  const updateUserMutation = useUpdateUserMutation();

  const offices = officesQuery.data ?? [];

  function handleContinue() {
    if (!selectedOfficeId) return;

    const selectedOffice = offices.find(
      (office) => office.id === Number(selectedOfficeId),
    );

    if (!selectedOffice) return;

    const payload: PatchUserRequest = createUpdateUserObjectPayload(
      undefined,
      undefined,
      selectedOffice.id,
    );

    updateUserMutation.mutate(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: generateCurrentUserKey(),
        });

        if (selectedOffice.name.toLowerCase() === "remote") {
          navigate("/calendar");
          return;
        }

        navigate("/users/schedule", {
          state: { office: selectedOffice },
        });
      },
    });
  }

  if (officesQuery.isPending) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <p className="text-lg text-neutral-500">Loading offices...</p>
      </div>
    );
  }

  if (officesQuery.isError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <p className="text-lg text-neutral-500">
          Unable to load offices. Please try again.
        </p>
      </div>
    );
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
            {offices.map((office) => (
              <OfficeItem key={office.id} office={office} />
            ))}
          </div>
        </RadioGroup.Root>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!selectedOfficeId || updateUserMutation.isPending}
        className="mt-12 w-full rounded-full bg-neutral-500 py-4 text-lg font-semibold text-white transition-colors enabled:hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {updateUserMutation.isPending ? "Saving..." : "Continue"}
      </button>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-6 flex items-center gap-1 font-semibold text-neutral-500 hover:text-fg-primary"
      >
        <span aria-hidden="true">‹</span>
        Go back
      </button>
    </div>
  );
}
