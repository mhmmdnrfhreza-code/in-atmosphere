import { describe, expect, it } from "vitest";
import type { AppState } from "../src/domain/entities/AppState.js";
import type { EmergencyAlert } from "../src/domain/entities/EmergencyAlert.js";
import { shouldSendEmergencyNow } from "../src/application/services/AlertDecisionService.js";

const NOW = new Date("2026-05-17T10:00:00.000Z");

function createState(overrides: Partial<AppState> = {}): AppState {
  return {
    lastAqi: null,
    lastUvIndex: null,
    lastRain: null,
    lastWindGust: null,
    lastCheckedAt: null,
    lastEmergencyAlert: {
      type: null,
      severity: null,
      sentAt: null,
    },
    ...overrides,
  };
}

function createAlert(overrides: Partial<EmergencyAlert> = {}): EmergencyAlert {
  return {
    shouldSend: true,
    type: "AIR_QUALITY",
    severity: "WATCH",
    title: "Alert",
    message: "Alert message",
    reasons: ["AQI tinggi"],
    ...overrides,
  };
}

describe("shouldSendEmergencyNow", () => {
  it("does not send when the analyzer marks the alert inactive", () => {
    const state = createState();
    const alert = createAlert({ shouldSend: false });

    expect(shouldSendEmergencyNow(alert, state, NOW)).toBe(false);
  });

  it("sends the first active alert", () => {
    const state = createState();
    const alert = createAlert();

    expect(shouldSendEmergencyNow(alert, state, NOW)).toBe(true);
  });

  it("does not bypass cooldown only because the alert type changes", () => {
    const state = createState({
      lastEmergencyAlert: {
        type: "AIR_QUALITY",
        severity: "WATCH",
        sentAt: "2026-05-17T09:00:00.000Z",
      },
    });
    const alert = createAlert({
      type: "UV",
      severity: "WATCH",
      reasons: ["UV tinggi"],
    });

    expect(shouldSendEmergencyNow(alert, state, NOW)).toBe(false);
  });

  it("sends during cooldown when severity escalates", () => {
    const state = createState({
      lastEmergencyAlert: {
        type: "AIR_QUALITY",
        severity: "WATCH",
        sentAt: "2026-05-17T09:45:00.000Z",
      },
    });
    const alert = createAlert({ severity: "WARNING" });

    expect(shouldSendEmergencyNow(alert, state, NOW)).toBe(true);
  });

  it("sends again after cooldown passes", () => {
    const state = createState({
      lastEmergencyAlert: {
        type: "AIR_QUALITY",
        severity: "WATCH",
        sentAt: "2026-05-17T07:59:00.000Z",
      },
    });
    const alert = createAlert();

    expect(shouldSendEmergencyNow(alert, state, NOW)).toBe(true);
  });
});
