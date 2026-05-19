import type { AlertLevel } from "../../domain/entities/AlertLevel.js";
import type { EmergencySeverity } from "../../domain/entities/EmergencyAlert.js";
import type { UvLevel } from "../../domain/rules/uvRules.js";
import { DiscordColors } from "../../shared/constants/discordColors.js";

export function resolveAqiColor(aqiLevel: AlertLevel): number {
  switch (aqiLevel) {
    case "GOOD":
      return DiscordColors.green;
    case "MODERATE":
      return DiscordColors.yellow;
    case "UNHEALTHY_SENSITIVE":
      return DiscordColors.orange;
    case "UNHEALTHY":
      return DiscordColors.red;
    case "VERY_UNHEALTHY":
      return DiscordColors.purple;
    case "HAZARDOUS":
      return 0x2c2c2c;
  }
}

export function resolveUvColor(uvLevel: UvLevel): number {
  switch (uvLevel) {
    case "LOW":
      return DiscordColors.green;
    case "MODERATE":
      return DiscordColors.yellow;
    case "HIGH":
      return DiscordColors.orange;
    case "VERY_HIGH":
      return DiscordColors.red;
    case "EXTREME":
      return DiscordColors.purple;
  }
}

export function resolveEmergencyColor(
  severity: EmergencySeverity | null
): number {
  switch (severity) {
    case "WATCH":
      return DiscordColors.orange;
    case "WARNING":
      return DiscordColors.red;
    case "DANGER":
      return DiscordColors.purple;
    default:
      return DiscordColors.blue;
  }
}