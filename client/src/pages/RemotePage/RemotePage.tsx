import type { CSSProperties } from "react";
import { useNavigate } from "react-router";

import type { Office } from "@/types/api/offices";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { heroImageFor } from "@/components/OfficePicker/heroImage";

// Offices map to their hero photo by a slugified name (e.g. "Falls Church" ->
// "falls-church-hero.webp"), the same convention the office picker uses.
function heroIdForOffice(office: Office): string {
  return office.name.toLowerCase().trim().replaceAll(" ", "-");
}

export default function RemotePage() {
  const navigate = useNavigate();
  const officesQuery = useOfficesQuery();

  const offices = officesQuery.data ?? [];

  // The physical offices are the only ones with a location to visit; the
  // "remote" pseudo-office has no card here.
  const officeCards = offices.filter(
    (office) => office.name.toLowerCase() !== "remote",
  );

  return (
    <div className="flex flex-1 flex-col bg-page">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
        <div className="flex flex-1 flex-col rounded-3xl bg-surface px-8 py-10 shadow-[0px_11.42px_34.26px_0px_#0000000F] sm:px-12 sm:py-12">
          <h1 className="text-2xl font-bold text-fg">Remote 🏡</h1>

          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-fg">
            This is your portal for traveling, visiting, or passing through one
            of the <span className="font-bold text-fg">Viget</span> offices.
            Pick a location to see who's in the office or schedule your next
            visit.
          </p>

          <div className="mt-10 grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {officeCards.map((office) => (
              <button
                key={office.id}
                type="button"
                onClick={() => navigate(`/calendar?office=${office.id}`)}
                className="relative capitalize flex min-h-[16rem] flex-col justify-between rounded-2xl bg-surface-strong bg-cover bg-center p-4 text-left shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
                style={
                  {
                    backgroundImage: `url(${heroImageFor(heroIdForOffice(office))})`,
                  } as CSSProperties
                }
              >
                <span className="self-start rounded-full bg-black/55 px-2.5 py-0.5 text-[0.625rem] font-semibold text-fg-inverse">
                  {office.name}
                </span>

                <div className="w-full rounded-full bg-surface py-2 text-center text-xs font-bold text-fg shadow-sm transition-colors">
                  See Office Schedule
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
