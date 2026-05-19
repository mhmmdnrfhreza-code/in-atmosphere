import type { ReportMode } from "../../domain/entities/ReportMode.js";
import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type { EmergencyAlert } from "../../domain/entities/EmergencyAlert.js";
import type { HealthAdvice } from "../../domain/entities/HealthAdvice.js";
import {
  classifyAqi,
  getAqiLabel,
} from "../../domain/rules/airQualityRules.js";
import { classifyUvIndex, getUvLabel } from "../../domain/rules/uvRules.js";
import { AppInfo } from "../../shared/constants/appInfo.js";
import { formatNumber } from "../../shared/utils/numberFormatter.js";
import type {
  DiscordEmbedField,
  DiscordWebhookPayload,
} from "./discordEmbedTypes.js";
import { bullet, joinLines, plainBullet } from "./embedText.js";
import { resolveAqiColor } from "./embedColorResolver.js";
import { formatRainForecast } from "./forecastText.js";

function getModeTitle(mode: ReportMode): string {
  switch (mode) {
    case "morning":
      return "Laporan Pagi";
    case "rush-hour":
      return "Laporan Jam Sibuk";
    case "emergency-watch":
      return "Emergency Watcher";
    case "manual":
      return "Manual Check";
  }
}

function getOverallStatus(alert: EmergencyAlert): string {
  if (!alert.shouldSend) {
    return "Normal / Pemantauan Rutin";
  }

  return `${alert.severity ?? "WATCH"} - ${alert.type ?? "MULTI_RISK"}`;
}

function buildFields(
  snapshot: AtmosSnapshot,
  alert: EmergencyAlert,
  advice: HealthAdvice,
  mode: ReportMode,
  dashboardUrl?: string
): DiscordEmbedField[] {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);
  const uvLevel = classifyUvIndex(snapshot.airQuality.uvIndex);
  const fields: DiscordEmbedField[] = [
    {
      name: "Status",
      value: joinLines([
        bullet("Mode", getModeTitle(mode)),
        bullet("Overall", getOverallStatus(alert)),
        bullet("Update", snapshot.generatedAt),
      ]),
      inline: false,
    },
    {
      name: "Metrik Utama",
      value: joinLines([
        bullet("AQI", `${snapshot.airQuality.usAqi} (${getAqiLabel(aqiLevel)})`),
        bullet(
          "UV",
          `${formatNumber(snapshot.airQuality.uvIndex)} (${getUvLabel(uvLevel)})`
        ),
        bullet(
          "Peluang Hujan",
          `${formatNumber(snapshot.forecast.maxPrecipitationProbability, 0)}%; estimasi ${formatRainForecast(snapshot)}`
        ),
        bullet("BMKG", snapshot.bmkgWarning.isActive ? "Aktif" : "Tidak aktif"),
      ]),
      inline: true,
    },
    {
      name: "Saran Praktis",
      value: joinLines([
        plainBullet(advice.general),
        plainBullet(advice.outdoor),
      ]),
      inline: true,
    },
  ];

  if (dashboardUrl) {
    fields.push({
      name: "Dashboard",
      value: dashboardUrl,
      inline: false,
    });
  }

  return fields;
}

export function createCurrentStatusEmbed(
  snapshot: AtmosSnapshot,
  alert: EmergencyAlert,
  advice: HealthAdvice,
  mode: ReportMode,
  dashboardUrl?: string
): DiscordWebhookPayload {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);

  return {
    username: AppInfo.name,
    avatar_url: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
    embeds: [
      {
        title: `${AppInfo.name} - Current Status ${snapshot.city}`,
        description:
          "Pesan Ini Adalah Referensi Status Terbaru Dan Diperbarui Otomatis.",
        color: resolveAqiColor(aqiLevel),
        fields: buildFields(snapshot, alert, advice, mode, dashboardUrl),
        footer: {
          text: "in-atmosphere™ © 2026 _mhmmdnrfhreza.care - 𝘢𝘭𝘭 𝘳𝘪𝘨𝘩𝘵𝘴 𝘳𝘦𝘴𝘦𝘳𝘷𝘦𝘥.",
        },
        timestamp: snapshot.generatedAt,
      },
    ],
  };
}
