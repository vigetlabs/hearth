import type { CSSProperties } from "react";

import type { Office } from "@/types/api/offices";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { heroImageFor } from "@/components/OfficePicker/heroImage";

// Offices map to their hero photo by a slugified name (e.g. "Falls Church" ->
// "falls-church-hero.webp"), the same convention the office picker uses.
function heroIdForOffice(office: Office): string {
  return office.name.toLowerCase().trim().replaceAll(" ", "-");
}

export default function RemotePage() {
  const officesQuery = useOfficesQuery();

  const offices = officesQuery.data ?? [];

  // The physical offices are the only ones with a location to visit; the
  // "remote" pseudo-office has no card here.
  const officeCards = offices.filter(
    (office) => office.name.toLowerCase() !== "remote",
  );

  return (
    <div className="flex flex-1 flex-col bg-surface-sunken">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-3xl bg-surface px-8 py-10 shadow-sm sm:px-12 sm:py-12">
          <h1 className="text-3xl font-bold text-fg">Remote 🏡</h1>

          <p className="mt-5 max-w-4xl text-base leading-relaxed text-fg-muted">
            This is your portal for traveling, visiting, or passing through one
            of <span className="font-bold text-fg">Viget</span> offices. Pick a
            location to see who's planning to be there each week, and when you
            need to add your own visit so they can see you're coming too.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {officeCards.map((office) => (
              <div
                key={office.id}
                className="relative flex aspect-[3/4] flex-col justify-between rounded-2xl bg-surface-strong bg-cover bg-center p-4 shadow-sm"
                style={
                  {
                    backgroundImage: `url(${heroImageFor(heroIdForOffice(office))})`,
                  } as CSSProperties
                }
              >
                <span className="self-start rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-fg-inverse">
                  {office.name}
                </span>

                <button
                  type="button"
                  className="w-full rounded-full bg-surface py-3 text-sm font-bold text-fg shadow-sm transition-colors hover:bg-surface-muted"
                >
                  See Office Schedule
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
