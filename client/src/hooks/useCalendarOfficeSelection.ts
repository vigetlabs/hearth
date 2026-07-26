// pages/CalendarPage/hooks/useCalendarOfficeSelection.ts

import {
  useCallback,
  useMemo,
} from "react";
import { useSearchParams } from "react-router";

import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";

import { useOfficesQuery } from "@/util/api/queries/officeQueries";

interface CalendarOfficeSelection {
  offices: readonly Office[];
  activeOffice: Office | null;
  defaultOffice: Office | null;
  changeOffice: (office: Office) => void;
  isLoading: boolean;
  isError: boolean;
}

export function useCalendarOfficeSelection(
  user: User | undefined,
): CalendarOfficeSelection {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const officesQuery = useOfficesQuery();

  const offices = officesQuery.data ?? [];

  const defaultOffice = useMemo(
    () =>
      findCurrentUserOffice(
        offices,
        user,
      ),
    [offices, user],
  );

  const requestedOfficeId =
    resolveRequestedOfficeId({
      searchParams,
      offices,
      user,
    });

  const activeOffice =
    findActiveOffice(
      offices,
      requestedOfficeId,
    ) ?? defaultOffice;

  const changeOffice = useCallback(
    (nextOffice: Office): void => {
      setSearchParams((currentParams) => {
        const nextParams =
          new URLSearchParams(currentParams);

        nextParams.set(
          "office",
          String(nextOffice.id),
        );

        return nextParams;
      });
    },
    [setSearchParams],
  );

  return {
    offices,
    activeOffice,
    defaultOffice,
    changeOffice,
    isLoading: officesQuery.isLoading,
    isError: officesQuery.isError,
  };
}

interface ResolveRequestedOfficeIdOptions {
  searchParams: URLSearchParams;
  offices: readonly Office[];
  user: User | undefined;
}

function resolveRequestedOfficeId({
  searchParams,
  offices,
  user,
}: ResolveRequestedOfficeIdOptions):
  number | undefined {
  const officeIdParam =
    searchParams.get("office");

  const parsedOfficeId = officeIdParam
    ? Number(officeIdParam)
    : undefined;

  if (Number.isFinite(parsedOfficeId)) {
    return parsedOfficeId;
  }

  const isDefaultOfficeRemote =
    user?.office?.name.toLowerCase() ===
    "remote";

  if (isDefaultOfficeRemote) {
    return offices.find(
      (office) =>
        office.name.toLowerCase() !==
        "remote",
    )?.id;
  }

  return user?.office?.id;
}

function findCurrentUserOffice(
  offices: readonly Office[],
  user: User | undefined,
): Office | null {
  if (!user) {
    return null;
  }

  return (
    offices.find(
      (office) =>
        office.id === user.office?.id,
    ) ??
    offices[0] ??
    null
  );
}

function findActiveOffice(
  offices: readonly Office[],
  requestedOfficeId: number | undefined,
): Office | null {
  if (requestedOfficeId === undefined) {
    return null;
  }

  return (
    offices.find(
      (office) =>
        office.id === requestedOfficeId,
    ) ?? null
  );
}
