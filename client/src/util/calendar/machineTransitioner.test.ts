import { describe, expect, it } from "vitest";

import { calendarMachineReducer } from "./machineTransitioner";
import {
  machineStates,
  type CalendarScope,
  type ConfirmedState,
  type ConfirmingState,
  type PlanningState,
} from "@/types/calendar/machineState";
import type { CalendarMachineEvent } from "@/types/calendar/machineEvent";

describe("calendarMachineReducer", () => {
  const scope: CalendarScope = {
    officeId: 7,
    weekStart: "2026-07-20",
  };

  describe("PLANNING", () => {
    const state: PlanningState = {
      status: machineStates.PLANNING,
      scope,
      draftDates: new Set([
        "2026-07-21"
      ])
    };

    it("adds a selected date to the dates draft", () => {
      const evt: CalendarMachineEvent = {
        type: "DATE_SELECTED",
        date: "2026-07-23"
      };

      const nextState = calendarMachineReducer(state, evt);

      expect(nextState).toEqual({
        status: machineStates.PLANNING,
        scope,
        draftDates: new Set([
          "2026-07-21",
          "2026-07-23"
        ])
      });
    })

    it("removes a deselected date from the dates draft", () => {
      const evt: CalendarMachineEvent = {
        type: "DATE_DESELECTED",
        date: "2026-07-23"
      }

      const nextState = calendarMachineReducer(state, evt);

      expect(nextState).toEqual({
        status: machineStates.PLANNING,
        scope,
        draftDates: new Set([
          "2026-07-21"
        ])
      });
    });

    it("does not mutate the previous dates draft set", () => {
      const draftDates = new Set([
        "2026-07-21",
        "2026-07-23"
      ]);

      const state: PlanningState = {
        status: machineStates.PLANNING,
        scope,
        draftDates
      };

      const evt: CalendarMachineEvent = {
        type: "DATE_SELECTED",
        date: "2026-07-23"
      };

      const nextState = calendarMachineReducer(state, evt);

      expect(draftDates).toEqual(
        new Set(["2026-07-21", "2026-07-23"])
      );

      if (nextState.status === machineStates.PLANNING) {
        expect(nextState.draftDates).not.toBe(draftDates);
      }
    });

    it("moves to CONFIRMING when confirmation is requested", () => {
      const evt: CalendarMachineEvent = {
        type: "CONFIRM_REQUESTED"
      };

      const nextState = calendarMachineReducer(state, evt);

      expect(nextState).toEqual({
        status: machineStates.CONFIRMING,
        scope,
        draftDates: new Set([
          "2026-07-21"
        ])
      });
    });
  });

  describe("CONFIRMING", () => {
    const state: ConfirmingState = {
      status: machineStates.CONFIRMING,
      scope,
      draftDates: new Set([
        "2026-07-21",
        "2026-07-23"
      ])
    };

    it("moves to CONFIRMED when confirmation succeeds", () => {
      const evt: CalendarMachineEvent = {
        type: "CONFIRM_SUCCEEDED",
        selectedDates: [
          "2026-07-21",
          "2026-07-23"
        ]
      };

      const nextState = calendarMachineReducer(state, evt);

      expect(nextState).toEqual({
        status: machineStates.CONFIRMED,
        scope,
        confirmedDates: new Set([
          "2026-07-21",
          "2026-07-23"
        ])
      });
    });

    it("returns to PLANNING when confirmation fails", () => {
      const evt: CalendarMachineEvent = {
        type: "CONFIRM_FAILED"
      }

      const nextState = calendarMachineReducer(state, evt);

      expect(nextState).toEqual({
        status: machineStates.PLANNING,
        scope,
        draftDates: new Set([
          "2026-07-21",
          "2026-07-23"
        ])
      })
    });
  });

  describe("CONFIRMED", () => {
    const state: ConfirmedState = {
      status: machineStates.CONFIRMED,
      scope,
      confirmedDates: new Set([
        "2026-07-21"
      ])
    };

    it("updates confirmed dates after server synchronization", () => {
      const evt: CalendarMachineEvent = {
        type: "SERVER_SYNCHRONIZED",
        confirmed: true,
        selectedDates: [
          "2026-07-22",
          "2026-07-24"
        ]
      }

      const nextState = calendarMachineReducer(state, evt);

      expect(nextState).toEqual({
        status: machineStates.CONFIRMED,
        scope,
        confirmedDates: new Set([
          "2026-07-22",
          "2026-07-24"
        ])
      });
    });

    it("moves to PLANNING when the server reports the week is unconfirmed", () => {
      const evt: CalendarMachineEvent = {
        type: "SERVER_SYNCHRONIZED",
        confirmed: false,
        selectedDates: [
          "2026-07-21",
          "2026-07-23"
        ]
      }

      const nextState = calendarMachineReducer(state, evt);

      expect(nextState).toEqual({
        status: machineStates.PLANNING,
        scope,
        draftDates: new Set([
          "2026-07-21",
          "2026-07-23"
        ])
      });
    });
  });
});
