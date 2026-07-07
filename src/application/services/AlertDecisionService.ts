import type { EmergencyAlert } from "../../domain/entities/EmergencyAlert.js";

export function shouldSendEmergencyNow(
  alert: EmergencyAlert
): boolean {
  return alert.shouldSend;
}
