import type { AppState } from "../../domain/entities/AppState.js";
import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type { EmergencyAlert } from "../../domain/entities/EmergencyAlert.js";
import { readJsonFile, writeJsonFile } from "./JsonFileStorage.js";

const STATE_FILE_PATH = "data/state.json";

export const defaultAppState: AppState = {
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
  currentStatusMessageId: null,
  currentStatusUpdatedAt: null,
  activeEmergencyMessageId: null,
  previousEmergencyMessageId: null,
  activeEmergencyFingerprint: null,
  previousEmergencyFingerprint: null,
  activeEmergencySentAt: null,
  previousEmergencySentAt: null,
  recoveryMessageId: null,
  recoverySentAt: null,
  recoveryFingerprint: null,
};

export function normalizeAppState(state: Partial<AppState> = {}): AppState {
  return {
    ...defaultAppState,
    ...state,
    lastEmergencyAlert: {
      ...defaultAppState.lastEmergencyAlert,
      ...state.lastEmergencyAlert,
    },
  };
}

export async function getAppState(): Promise<AppState> {
  const state = await readJsonFile<Partial<AppState>>(
    STATE_FILE_PATH,
    defaultAppState
  );

  return normalizeAppState(state);
}

export async function saveAppState(state: AppState): Promise<void> {
  await writeJsonFile<AppState>(STATE_FILE_PATH, state);
}

export function createUpdatedState(
  previousState: AppState,
  snapshot: AtmosSnapshot,
  emergencyAlert: EmergencyAlert,
  wasEmergencySent: boolean
): AppState {
  const normalizedPreviousState = normalizeAppState(previousState);

  return {
    ...normalizedPreviousState,
    lastAqi: snapshot.airQuality.usAqi,
    lastUvIndex: snapshot.airQuality.uvIndex,
    lastRain: snapshot.weather.rain,
    lastWindGust: snapshot.weather.windGust,
    lastCheckedAt: snapshot.generatedAt,
    lastEmergencyAlert: wasEmergencySent
      ? {
          type: emergencyAlert.type,
          severity: emergencyAlert.severity,
          sentAt: snapshot.generatedAt,
        }
      : normalizedPreviousState.lastEmergencyAlert,
  };
}
