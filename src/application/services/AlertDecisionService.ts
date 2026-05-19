import type { AppState } from "../../domain/entities/AppState.js";
import type { EmergencyAlert } from "../../domain/entities/EmergencyAlert.js";
import { hasCooldownPassed } from "../../domain/rules/cooldownRules.js";

const DEFAULT_COOLDOWN_MINUTES = 120;

function isSeverityEscalated(
  currentSeverity: EmergencyAlert["severity"],
  previousSeverity: AppState["lastEmergencyAlert"]["severity"]
): boolean {
  const rank = {
    WATCH: 1,
    WARNING: 2,
    DANGER: 3,
  };

  if (!currentSeverity) return false;
  if (!previousSeverity) return true;

  return rank[currentSeverity] > rank[previousSeverity];
}

export function shouldSendEmergencyNow(
  alert: EmergencyAlert,
  state: AppState,
  now: Date = new Date()
): boolean {
  if (!alert.shouldSend) return false;

  const severityEscalated = isSeverityEscalated(
    alert.severity,
    state.lastEmergencyAlert.severity
  );

  if (severityEscalated) return true;

  return hasCooldownPassed(
    state.lastEmergencyAlert.sentAt,
    DEFAULT_COOLDOWN_MINUTES,
    now
  );
}
