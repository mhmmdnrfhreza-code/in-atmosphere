import type { EmergencyAlertType, EmergencySeverity } from "./EmergencyAlert.js";

export interface LastEmergencyAlertState {
  type: EmergencyAlertType | null;
  severity: EmergencySeverity | null;
  sentAt: string | null;
}

export interface AppState {
  lastAqi: number | null;
  lastUvIndex: number | null;
  lastRain: number | null;
  lastWindGust: number | null;
  lastCheckedAt: string | null;
  lastEmergencyAlert: LastEmergencyAlertState;
  currentStatusMessageId: string | null;
  currentStatusUpdatedAt: string | null;
  activeEmergencyMessageId: string | null;
  previousEmergencyMessageId: string | null;
  activeEmergencyFingerprint: string | null;
  previousEmergencyFingerprint: string | null;
  activeEmergencySentAt: string | null;
  previousEmergencySentAt: string | null;
  recoveryMessageId: string | null;
  recoverySentAt: string | null;
  recoveryFingerprint: string | null;
}
