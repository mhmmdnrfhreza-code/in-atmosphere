import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type { EmergencyAlert } from "../../domain/entities/EmergencyAlert.js";
import { classifyAqi } from "../../domain/rules/airQualityRules.js";
import { classifyUvIndex } from "../../domain/rules/uvRules.js";
import {
  isHeavyRain,
  isHighRainProbability,
  isStrongWindGust,
} from "../../domain/rules/weatherRiskRules.js";

function normalizeReason(reason: string): string {
  return reason.trim().replace(/\s+/g, " ").toLowerCase();
}

function classifyWeatherRisk(snapshot: AtmosSnapshot): string {
  if (isHeavyRain(snapshot.weather.rain)) return "HEAVY_RAIN";
  if (isStrongWindGust(snapshot.weather.windGust)) return "STRONG_WIND";
  if (isHighRainProbability(snapshot.forecast.maxPrecipitationProbability)) {
    return "HIGH_RAIN_PROBABILITY";
  }

  return "NORMAL";
}

export function createEmergencyFingerprint(
  snapshot: AtmosSnapshot,
  alert: EmergencyAlert
): string {
  const reasons = alert.reasons.slice(0, 4).map(normalizeReason).join(";");

  return [
    `type=${alert.type ?? "NONE"}`,
    `severity=${alert.severity ?? "NONE"}`,
    `reasons=${reasons}`,
    `bmkg=${snapshot.bmkgWarning.isActive}`,
    `aqi=${classifyAqi(snapshot.airQuality.usAqi)}`,
    `uv=${classifyUvIndex(snapshot.airQuality.uvIndex)}`,
    `weather=${classifyWeatherRisk(snapshot)}`,
  ].join("|");
}

export function createRecoveryFingerprint(
  activeEmergencyFingerprint: string
): string {
  return `recovered:${activeEmergencyFingerprint}`;
}
