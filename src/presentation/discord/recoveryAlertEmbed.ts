import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type { HealthAdvice } from "../../domain/entities/HealthAdvice.js";
import { classifyAqi, getAqiLabel } from "../../domain/rules/airQualityRules.js";
import { classifyUvIndex, getUvLabel } from "../../domain/rules/uvRules.js";
import { AppInfo } from "../../shared/constants/appInfo.js";
import { formatNumber } from "../../shared/utils/numberFormatter.js";
import type { DiscordWebhookPayload } from "./discordEmbedTypes.js";
import { bullet, joinLines, plainBullet } from "./embedText.js";
import { resolveAqiColor } from "./embedColorResolver.js";
import { formatRainForecast } from "./forecastText.js";

interface RecoveryContext {
  previousEmergencyFingerprint: string;
  previousEmergencySentAt: string | null;
}

export function createRecoveryAlertEmbed(
  snapshot: AtmosSnapshot,
  advice: HealthAdvice,
  context: RecoveryContext
): DiscordWebhookPayload {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);
  const uvLevel = classifyUvIndex(snapshot.airQuality.uvIndex);

  return {
    username: `${AppInfo.name} Recovery`,
    avatar_url: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
    embeds: [
      {
        title: `${AppInfo.name} - Kondisi Kembali Normal`,
        description: "Emergency Sebelumnya Telah Mereda.",
        color: resolveAqiColor(aqiLevel),
        fields: [
          {
            name: "Konteks Sebelumnya",
            value: joinLines([
              bullet("Fingerprint", context.previousEmergencyFingerprint),
              bullet("Terkirim", context.previousEmergencySentAt ?? "-"),
            ]),
            inline: false,
          },
          {
            name: "Kondisi Saat Ini",
            value: joinLines([
              bullet("AQI", `${snapshot.airQuality.usAqi} (${getAqiLabel(aqiLevel)})`),
              bullet(
                "UV",
                `${formatNumber(snapshot.airQuality.uvIndex)} (${getUvLabel(uvLevel)})`
              ),
              bullet("Estimasi Hujan", formatRainForecast(snapshot)),
              bullet("Hujan", `${formatNumber(snapshot.weather.rain)} mm`),
              bullet("BMKG", snapshot.bmkgWarning.isActive ? "Aktif" : "Tidak Aktif"),
            ]),
            inline: true,
          },
          {
            name: "Saran Praktis",
            value: plainBullet(advice.general),
            inline: true,
          },
        ],
        footer: {
          text: "Recovery Alert Dikirim Saat Emergency Benar-Benar Mereda.",
        },
        timestamp: snapshot.generatedAt,
      },
    ],
  };
}
