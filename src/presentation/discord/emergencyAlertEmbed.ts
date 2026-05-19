import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type { EmergencyAlert } from "../../domain/entities/EmergencyAlert.js";
import type { HealthAdvice } from "../../domain/entities/HealthAdvice.js";
import {
  classifyAqi,
  getAqiEmoji,
  getAqiLabel,
} from "../../domain/rules/airQualityRules.js";
import {
  classifyUvIndex,
  getUvEmoji,
  getUvLabel,
} from "../../domain/rules/uvRules.js";
import { AppInfo } from "../../shared/constants/appInfo.js";
import { formatNumber } from "../../shared/utils/numberFormatter.js";
import type {
  DiscordEmbedField,
  DiscordWebhookPayload,
} from "./discordEmbedTypes.js";
import {
  bullet,
  fallbackText,
  formatListOrFallback,
  joinLines,
  plainBullet,
  truncateDiscordField,
} from "./embedText.js";
import { resolveEmergencyColor } from "./embedColorResolver.js";
import { formatRainForecast } from "./forecastText.js";

function buildAlertDescription(snapshot: AtmosSnapshot, alert: EmergencyAlert): string {
  if (!alert.shouldSend) {
    return `Tidak Ada Peringatan Darurat Untuk **${snapshot.city}**.`;
  }

  return `Peringatan Untuk **${snapshot.city}**. Lihat Pemicu Dan Saran Praktis Di Bawah.`;
}

function buildBmkgField(snapshot: AtmosSnapshot): DiscordEmbedField | null {
  if (!snapshot.bmkgWarning.isActive) {
    return null;
  }

  return {
    name: "⚡ BMKG",
    value: truncateDiscordField(
      joinLines([
        bullet("Judul", fallbackText(snapshot.bmkgWarning.title)),
        fallbackText(snapshot.bmkgWarning.description),
      ]),
      700
    ),
    inline: false,
  };
}

function buildFields(
  snapshot: AtmosSnapshot,
  alert: EmergencyAlert,
  advice: HealthAdvice
): DiscordEmbedField[] {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);
  const uvLevel = classifyUvIndex(snapshot.airQuality.uvIndex);
  const bmkgField = buildBmkgField(snapshot);

  return [
    {
      name: "⚠️ Status",
      value: joinLines([
        bullet("Severity", alert.severity ?? "-"),
        bullet("Tipe", alert.type ?? "-"),
        `${getAqiEmoji(aqiLevel)} AQI: **${snapshot.airQuality.usAqi} (${getAqiLabel(aqiLevel)})**`,
        `${getUvEmoji(uvLevel)} UV: **${formatNumber(snapshot.airQuality.uvIndex)} (${getUvLabel(uvLevel)})**`,
      ]),
      inline: true,
    },
    {
      name: "🌧️ Cuaca",
      value: joinLines([
        bullet("Hujan Saat Ini", `${formatNumber(snapshot.weather.rain)} mm`),
        bullet(
          "Peluang Hujan",
          `${formatNumber(snapshot.forecast.maxPrecipitationProbability, 0)}%`
        ),
        bullet("Estimasi Hujan", formatRainForecast(snapshot)),
        bullet("Hembusan Angin", `${formatNumber(snapshot.weather.windGust)} km/jam`),
      ]),
      inline: true,
    },
    {
      name: "⚙️ Pemicu Peringatan",
      value: truncateDiscordField(
        formatListOrFallback(alert.reasons.slice(0, 4), "Tidak ada alasan darurat yang terdeteksi."),
        700
      ),
      inline: false,
    },
    ...(bmkgField ? [bmkgField] : []),
    {
      name: "📄 Saran Praktis",
      value: truncateDiscordField(
        joinLines([
          plainBullet(advice.general),
          plainBullet(advice.outdoor),
          plainBullet(`Kelompok Sensitif: ${advice.sensitiveGroup}`),
        ]),
        700
      ),
      inline: false,
    },
  ];
}

export function createEmergencyAlertEmbed(
  snapshot: AtmosSnapshot,
  alert: EmergencyAlert,
  advice: HealthAdvice
): DiscordWebhookPayload {
  return {
    username: `${AppInfo.name} Alert`,
    avatar_url: "https://cdn-icons-png.flaticon.com/512/564/564619.png",
    embeds: [
      {
        title: alert.title,
        description: buildAlertDescription(snapshot, alert),
        color: resolveEmergencyColor(alert.severity),
        fields: buildFields(snapshot, alert, advice),
        footer: {
          text: "Keputusan Darurat, Prioritaskan Informasi Resmi BMKG Dan Instansi Terkait.",
        },
        timestamp: snapshot.generatedAt,
      },
    ],
  };
}
