export type EmergencyAlertType =
  | "AIR_QUALITY"
  | "UV"
  | "HEAVY_RAIN"
  | "STRONG_WIND"
  | "MULTI_RISK";

export type EmergencySeverity = "WATCH" | "WARNING" | "DANGER";

export interface EmergencyAlert {
  shouldSend: boolean;
  type: EmergencyAlertType | null;
  severity: EmergencySeverity | null;
  title: string;
  message: string;
  reasons: string[];
}