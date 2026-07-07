import { describe, expect, it, vi } from "vitest";
import type { AppState } from "../src/domain/entities/AppState.js";
import type { AtmosSnapshot } from "../src/domain/entities/AtmosSnapshot.js";
import type { EmergencyAlert } from "../src/domain/entities/EmergencyAlert.js";
import type { HealthAdvice } from "../src/domain/entities/HealthAdvice.js";
import { normalizeAppState } from "../src/infrastructure/storage/AppStateRepository.js";
import {
  type DiscordWebhookMessageClient,
} from "../src/infrastructure/discord/DiscordWebhookClient.js";
import { processDiscordNotifications } from "../src/application/services/DiscordNotificationOrchestrator.js";

const advice: HealthAdvice = {
  general: "Pantau kondisi berkala.",
  outdoor: "Kurangi aktivitas luar bila perlu.",
  sensitiveGroup: "Kelompok sensitif perlu waspada.",
};

function createState(overrides: Partial<AppState> = {}): AppState {
  return normalizeAppState({
    lastAqi: 80,
    lastUvIndex: 4,
    lastRain: 0,
    lastWindGust: 10,
    lastCheckedAt: "2026-05-17T09:00:00.000Z",
    lastEmergencyAlert: {
      type: null,
      severity: null,
      sentAt: null,
    },
    ...overrides,
  });
}

function createSnapshot(overrides: Partial<AtmosSnapshot> = {}): AtmosSnapshot {
  return {
    city: "Kota Bogor",
    generatedAt: "2026-05-17T10:00:00.000Z",
    weather: {
      temperature: 28,
      humidity: 78,
      rain: 0,
      windSpeed: 8,
      windGust: 12,
    },
    airQuality: {
      usAqi: 80,
      pm25: 22,
      pm10: 44,
      ozone: 18,
      uvIndex: 4,
    },
    forecast: {
      minTemperature: 24,
      maxTemperature: 31,
      maxPrecipitationProbability: 50,
      nextRainTime: "2026-05-18T14:00",
      nextRainProbability: 50,
      peakRainTime: "2026-05-18T15:00",
      maxUvIndex: 7,
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
    shouldSend: false,
    type: null,
    severity: null,
    title: "Tidak Ada Emergency Alert",
    message: "Normal",
    reasons: [],
    ...overrides,
  };
}

function createClient(): DiscordWebhookMessageClient {
  return {
    sendPayload: vi.fn(async () => undefined),
    sendPayloadAndReturnMessage: vi.fn(async () => ({ id: "sent-id" })),
    editMessage: vi.fn(async () => undefined),
    deleteMessage: vi.fn(async () => true),
  };
}

describe("processDiscordNotifications", () => {
  it("creates Current Status as new message on first routine run", async () => {
    const client = createClient();
    vi.mocked(client.sendPayloadAndReturnMessage).mockResolvedValueOnce({ id: "status-1" });

    const result = await processDiscordNotifications({
      state: createState(),
      snapshot: createSnapshot(),
      emergencyAlert: createAlert(),
      advice,
      reportMode: "morning",
      client,
    });

    expect(client.sendPayloadAndReturnMessage).toHaveBeenCalledTimes(1);
    expect(client.editMessage).not.toHaveBeenCalled();
    expect(result.currentStatusMessageId).toBe("status-1");
    expect(result.currentStatusUpdatedAt).toBe("2026-05-17T10:00:00.000Z");
  });

  it("deletes old Current Status and sends new one to stay at latest position", async () => {
    const client = createClient();
    vi.mocked(client.sendPayloadAndReturnMessage).mockResolvedValueOnce({ id: "status-2" });

    const result = await processDiscordNotifications({
      state: createState({ currentStatusMessageId: "status-1" }),
      snapshot: createSnapshot(),
      emergencyAlert: createAlert(),
      advice,
      reportMode: "rush-hour",
      client,
    });

    expect(client.deleteMessage).toHaveBeenCalledWith("status-1");
    expect(client.sendPayloadAndReturnMessage).toHaveBeenCalledTimes(1);
    expect(client.editMessage).not.toHaveBeenCalled();
    expect(result.currentStatusMessageId).toBe("status-2");
  });

  it("skips duplicate emergency with unchanged fingerprint", async () => {
    const client = createClient();
    const snapshot = createSnapshot({ airQuality: { ...createSnapshot().airQuality, usAqi: 156 } });
    const alert = createAlert({
      shouldSend: true,
      type: "AIR_QUALITY",
      severity: "WARNING",
      reasons: ["AQI mencapai 156"],
    });
    const state = createState({
      currentStatusMessageId: "status-1",
      activeEmergencyMessageId: "emergency-1",
      activeEmergencyFingerprint: "type=AIR_QUALITY|severity=WARNING|reasons=aqi mencapai 156|bmkg=false|aqi=UNHEALTHY|uv=MODERATE|weather=NORMAL",
      activeEmergencySentAt: "2026-05-17T09:00:00.000Z",
      lastEmergencyAlert: {
        type: "AIR_QUALITY",
        severity: "WARNING",
        sentAt: "2026-05-17T09:00:00.000Z",
      },
    });

    const result = await processDiscordNotifications({
      state,
      snapshot,
      emergencyAlert: alert,
      advice,
      reportMode: "emergency-watch",
      client,
    });

    expect(result.activeEmergencyMessageId).toBe("emergency-1");
  });

  it("sends emergency immediately without cooldown when fingerprint differs", async () => {
    const client = createClient();
    vi.mocked(client.sendPayloadAndReturnMessage)
      .mockResolvedValueOnce({ id: "emergency-2" })
      .mockResolvedValueOnce({ id: "status-new" });
    const snapshot = createSnapshot({ airQuality: { ...createSnapshot().airQuality, usAqi: 200 } });
    const alert = createAlert({
      shouldSend: true,
      type: "AIR_QUALITY",
      severity: "WARNING",
      reasons: ["AQI mencapai 200"],
    });

    const result = await processDiscordNotifications({
      state: createState({
        currentStatusMessageId: "status-1",
        activeEmergencyMessageId: "emergency-1",
        activeEmergencyFingerprint: "old-fingerprint",
        activeEmergencySentAt: "2026-05-17T09:55:00.000Z",
        lastEmergencyAlert: {
          type: "AIR_QUALITY",
          severity: "WARNING",
          sentAt: "2026-05-17T09:55:00.000Z",
        },
      }),
      snapshot,
      emergencyAlert: alert,
      advice,
      reportMode: "emergency-watch",
      client,
    });

    expect(result.activeEmergencyMessageId).toBe("emergency-2");
  });

  it("rotates emergency context and deletes older previous emergency", async () => {
    const client = createClient();
    vi.mocked(client.sendPayloadAndReturnMessage)
      .mockResolvedValueOnce({ id: "emergency-2" })
      .mockResolvedValueOnce({ id: "status-ignored" });
    const snapshot = createSnapshot({ airQuality: { ...createSnapshot().airQuality, usAqi: 220 } });
    const alert = createAlert({
      shouldSend: true,
      type: "AIR_QUALITY",
      severity: "DANGER",
      reasons: ["AQI mencapai 220"],
    });

    const result = await processDiscordNotifications({
      state: createState({
        currentStatusMessageId: "status-1",
        activeEmergencyMessageId: "emergency-1",
        previousEmergencyMessageId: "emergency-0",
        activeEmergencyFingerprint: "old-active",
        previousEmergencyFingerprint: "old-previous",
        activeEmergencySentAt: "2026-05-17T09:00:00.000Z",
        previousEmergencySentAt: "2026-05-17T08:00:00.000Z",
      }),
      snapshot,
      emergencyAlert: alert,
      advice,
      reportMode: "emergency-watch",
      client,
    });

    expect(client.deleteMessage).toHaveBeenCalledWith("emergency-0");
    expect(result.previousEmergencyMessageId).toBe("emergency-1");
    expect(result.activeEmergencyMessageId).toBe("emergency-2");
    expect(result.lastEmergencyAlert.sentAt).toBe("2026-05-17T10:00:00.000Z");
  });

  it("sends recovery once after tracked emergency clears", async () => {
    const client = createClient();
    vi.mocked(client.sendPayloadAndReturnMessage)
      .mockResolvedValueOnce({ id: "recovery-1" })
      .mockResolvedValueOnce({ id: "status-new" });

    const result = await processDiscordNotifications({
      state: createState({
        currentStatusMessageId: "status-1",
        activeEmergencyMessageId: "emergency-1",
        activeEmergencyFingerprint: "old-active",
        activeEmergencySentAt: "2026-05-17T09:00:00.000Z",
      }),
      snapshot: createSnapshot(),
      emergencyAlert: createAlert(),
      advice,
      reportMode: "manual",
      client,
    });

    expect(result.recoveryMessageId).toBe("recovery-1");
    expect(result.activeEmergencyMessageId).toBeNull();
  });

  it("does not send repeated recovery while already normal", async () => {
    const client = createClient();
    vi.mocked(client.sendPayloadAndReturnMessage).mockResolvedValueOnce({ id: "status-new" });

    await processDiscordNotifications({
      state: createState({
        currentStatusMessageId: "status-1",
        recoveryMessageId: "recovery-1",
        recoveryFingerprint: "recovered:old-active",
      }),
      snapshot: createSnapshot(),
      emergencyAlert: createAlert(),
      advice,
      reportMode: "manual",
      client,
    });

    // Only current status send, no recovery send
    expect(client.sendPayloadAndReturnMessage).toHaveBeenCalledTimes(1);
  });

  it("deletes stale recovery when a new emergency starts", async () => {
    const client = createClient();
    vi.mocked(client.sendPayloadAndReturnMessage)
      .mockResolvedValueOnce({ id: "emergency-1" })
      .mockResolvedValueOnce({ id: "status-new" });

    const result = await processDiscordNotifications({
      state: createState({
        currentStatusMessageId: "status-1",
        recoveryMessageId: "recovery-1",
        recoveryFingerprint: "recovered:old-active",
      }),
      snapshot: createSnapshot({ airQuality: { ...createSnapshot().airQuality, usAqi: 156 } }),
      emergencyAlert: createAlert({
        shouldSend: true,
        type: "AIR_QUALITY",
        severity: "WARNING",
        reasons: ["AQI mencapai 156"],
      }),
      advice,
      reportMode: "emergency-watch",
      client,
    });

    expect(client.deleteMessage).toHaveBeenCalledWith("recovery-1");
    expect(result.recoveryMessageId).toBeNull();
  });

  it("preserves recovered emergency context as previous when a new emergency starts", async () => {
    const client = createClient();
    vi.mocked(client.sendPayloadAndReturnMessage)
      .mockResolvedValueOnce({ id: "emergency-d" })
      .mockResolvedValueOnce({ id: "status-new" });

    const result = await processDiscordNotifications({
      state: createState({
        currentStatusMessageId: "status-1",
        previousEmergencyMessageId: "emergency-c",
        previousEmergencyFingerprint: "recovered-emergency-c",
        previousEmergencySentAt: "2026-05-17T09:00:00.000Z",
        recoveryMessageId: "recovery-1",
        recoveryFingerprint: "recovered:recovered-emergency-c",
      }),
      snapshot: createSnapshot({ airQuality: { ...createSnapshot().airQuality, usAqi: 156 } }),
      emergencyAlert: createAlert({
        shouldSend: true,
        type: "AIR_QUALITY",
        severity: "WARNING",
        reasons: ["AQI mencapai 156"],
      }),
      advice,
      reportMode: "emergency-watch",
      client,
    });

    expect(client.deleteMessage).toHaveBeenCalledWith("recovery-1");
    expect(client.deleteMessage).not.toHaveBeenCalledWith("emergency-c");
    expect(result.previousEmergencyMessageId).toBe("emergency-c");
    expect(result.activeEmergencyMessageId).toBe("emergency-d");
  });

  it("ignores delete 404 while rotating emergency messages", async () => {
    const client = createClient();
    vi.mocked(client.deleteMessage).mockResolvedValueOnce(false);
    vi.mocked(client.sendPayloadAndReturnMessage)
      .mockResolvedValueOnce({ id: "emergency-2" })
      .mockResolvedValueOnce({ id: "status-new" });

    const result = await processDiscordNotifications({
      state: createState({
        currentStatusMessageId: "status-1",
        activeEmergencyMessageId: "emergency-1",
        previousEmergencyMessageId: "missing-emergency",
        activeEmergencyFingerprint: "old-active",
      }),
      snapshot: createSnapshot({ airQuality: { ...createSnapshot().airQuality, usAqi: 220 } }),
      emergencyAlert: createAlert({
        shouldSend: true,
        type: "AIR_QUALITY",
        severity: "DANGER",
        reasons: ["AQI mencapai 220"],
      }),
      advice,
      reportMode: "emergency-watch",
      client,
    });

    expect(result.activeEmergencyMessageId).toBe("emergency-2");
  });
});
