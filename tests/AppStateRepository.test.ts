import { describe, expect, it } from "vitest";
import type { AppState } from "../src/domain/entities/AppState.js";
import { defaultAppState, normalizeAppState } from "../src/infrastructure/storage/AppStateRepository.js";

describe("normalizeAppState", () => {
  it("merges missing Discord lifecycle fields with null defaults", () => {
    const legacyState = {
      lastAqi: 156,
      lastUvIndex: 0,
      lastRain: 0,
      lastWindGust: 7.9,
      lastCheckedAt: "2026-05-17T11:24:00.670Z",
      lastEmergencyAlert: {
        type: "MULTI_RISK",
        severity: "WARNING",
        sentAt: "2026-05-17T10:01:00.045Z",
      },
    } satisfies Partial<AppState>;

    expect(normalizeAppState(legacyState)).toEqual({
      ...defaultAppState,
      ...legacyState,
      lastEmergencyAlert: legacyState.lastEmergencyAlert,
    });
  });

  it("preserves existing Discord lifecycle fields", () => {
    const state = normalizeAppState({
      currentStatusMessageId: "status-1",
      currentStatusUpdatedAt: "2026-05-17T10:00:00.000Z",
      activeEmergencyMessageId: "emergency-1",
      activeEmergencyFingerprint: "fp-1",
      activeEmergencySentAt: "2026-05-17T10:01:00.000Z",
    });

    expect(state.currentStatusMessageId).toBe("status-1");
    expect(state.currentStatusUpdatedAt).toBe("2026-05-17T10:00:00.000Z");
    expect(state.activeEmergencyMessageId).toBe("emergency-1");
    expect(state.activeEmergencyFingerprint).toBe("fp-1");
    expect(state.activeEmergencySentAt).toBe("2026-05-17T10:01:00.000Z");
  });
});
