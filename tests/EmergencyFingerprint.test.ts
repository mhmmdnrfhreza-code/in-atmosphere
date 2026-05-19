import { describe, expect, it } from "vitest";
import type { AtmosSnapshot } from "../src/domain/entities/AtmosSnapshot.js";
import type { EmergencyAlert } from "../src/domain/entities/EmergencyAlert.js";
import { createEmergencyFingerprint } from "../src/application/services/EmergencyFingerprint.js";

function createSnapshot(overrides: Partial<AtmosSnapshot> = {}): AtmosSnapshot {
  return {
    city: "Kota Bogor",
    generatedAt: "2026-05-17T10:00:00.000Z",
    weather: {
      temperature: 28,
      humidity: 80,
      rain: 0,
      windSpeed: 8,
      windGust: 12,
    },
    airQuality: {
      usAqi: 156,
      pm25: 55,
      pm10: 80,
      ozone: 20,
      uvIndex: 4,
    },
    forecast: {
      minTemperature: 24,
      maxTemperature: 31,
      maxPrecipitationProbability: 70,
      nextRainTime: "2026-05-18T14:00",
      nextRainProbability: 70,
      peakRainTime: "2026-05-18T15:00",
      maxUvIndex: 8,
    },
    bmkgWarning: {
      isActive: false,
      title: null,
      description: null,
      publishedAt: null,
      matchedKeywords: [],
    },
    ...overrides,
  };
}

function createAlert(overrides: Partial<EmergencyAlert> = {}): EmergencyAlert {
  return {
    shouldSend: true,
    type: "AIR_QUALITY",
    severity: "WARNING",
    title: "Emergency Alert",
    message: "Perlu perhatian.",
    reasons: ["AQI mencapai 156", "Peluang hujan tinggi"],
    ...overrides,
  };
}

describe("createEmergencyFingerprint", () => {
  it("is stable when generatedAt and reason casing change", () => {
    const first = createEmergencyFingerprint(
      createSnapshot({ generatedAt: "2026-05-17T10:00:00.000Z" }),
      createAlert({ reasons: ["AQI mencapai 156"] })
    );
    const second = createEmergencyFingerprint(
      createSnapshot({ generatedAt: "2026-05-17T10:30:00.000Z" }),
      createAlert({ reasons: ["  aqi MENCAPAI 156  "] })
    );

    expect(second).toBe(first);
  });

  it("changes when meaningful risk identity changes", () => {
    const first = createEmergencyFingerprint(createSnapshot(), createAlert());
    const second = createEmergencyFingerprint(
      createSnapshot({ airQuality: { ...createSnapshot().airQuality, usAqi: 220 } }),
      createAlert({ severity: "DANGER" })
    );

    expect(second).not.toBe(first);
  });
});
