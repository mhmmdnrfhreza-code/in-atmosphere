import { describe, expect, it } from "vitest";
import type { EmergencyAlert } from "../src/domain/entities/EmergencyAlert.js";
import { shouldSendEmergencyNow } from "../src/application/services/AlertDecisionService.js";

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
    const alert = createAlert({ shouldSend: false });

    expect(shouldSendEmergencyNow(alert)).toBe(false);
  });

  it("sends the first active alert", () => {
    const alert = createAlert();

    expect(shouldSendEmergencyNow(alert)).toBe(true);
  });

  it("sends immediately regardless of alert type changes", () => {
    const alert = createAlert({
      type: "UV",
      severity: "WATCH",
      reasons: ["UV tinggi"],
    });

    expect(shouldSendEmergencyNow(alert)).toBe(true);
  });

  it("sends immediately when severity escalates", () => {
    const alert = createAlert({ severity: "WARNING" });

    expect(shouldSendEmergencyNow(alert)).toBe(true);
  });

  it("sends immediately without any cooldown", () => {
    const alert = createAlert();

    expect(shouldSendEmergencyNow(alert)).toBe(true);
  });
});
