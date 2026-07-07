import type { ReportMode } from "../../domain/entities/ReportMode.js";
import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
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
  joinLines,
  plainBullet,
  truncateDiscordField,
} from "./embedText.js";
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
      return "Laporan Manual";
  }
}

function buildPrimaryAction(snapshot: AtmosSnapshot, advice: HealthAdvice): string {
  if (snapshot.bmkgWarning.isActive) {
    return "Pantau peringatan BMKG dan atur ulang aktivitas luar jika cuaca memburuk.";
  }

  if (snapshot.airQuality.usAqi >= 151) {
    return "Kurangi paparan luar ruangan dan gunakan masker yang sesuai bila harus bepergian.";
  }

  if (snapshot.forecast.maxPrecipitationProbability >= 70) {
    return "Siapkan payung atau jas hujan, terutama untuk perjalanan sore atau pulang kerja.";
  }

  if (snapshot.forecast.maxUvIndex >= 8) {
    return "Gunakan perlindungan matahari saat beraktivitas di luar ruangan.";
  }

  return advice.general;
}

function buildSummary(snapshot: AtmosSnapshot): string {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);
  const uvLevel = classifyUvIndex(snapshot.airQuality.uvIndex);
  const rainTiming = snapshot.forecast.nextRainTime
    ? `, estimasi hujan **${formatRainForecast(snapshot)}**`
    : "";

  return `**${snapshot.city}**: AQI **${snapshot.airQuality.usAqi} (${getAqiLabel(aqiLevel)})**, UV **${formatNumber(snapshot.airQuality.uvIndex)} (${getUvLabel(uvLevel)})**, peluang hujan **${formatNumber(snapshot.forecast.maxPrecipitationProbability, 0)}%**${rainTiming}.`;
}

function buildBmkgField(snapshot: AtmosSnapshot): DiscordEmbedField | null {
  if (!snapshot.bmkgWarning.isActive) {
    return null;
  }

  return {
    name: "⚡ BMKG Aktif",
    value: truncateDiscordField(
      joinLines([
        bullet("Judul", fallbackText(snapshot.bmkgWarning.title)),
        snapshot.bmkgWarning.description
          ? fallbackText(snapshot.bmkgWarning.description)
          : "Ada Peringatan Dini Cuaca Yang Relevan Dengan Bogor.",
      ]),
      700
    ),
    inline: false,
  };
}

function buildFields(
  snapshot: AtmosSnapshot,
  advice: HealthAdvice
): DiscordEmbedField[] {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);
  const uvLevel = classifyUvIndex(snapshot.airQuality.uvIndex);
  const bmkgField = buildBmkgField(snapshot);

  return [
    {
      name: "⚠️ Status",
      value: joinLines([
        `${getAqiEmoji(aqiLevel)} AQI: **${snapshot.airQuality.usAqi} (${getAqiLabel(aqiLevel)})**`,
        `${getUvEmoji(uvLevel)} UV: **${formatNumber(snapshot.airQuality.uvIndex)} (${getUvLabel(uvLevel)})**`,
        bullet(
          "Peluang Hujan",
          `${formatNumber(snapshot.forecast.maxPrecipitationProbability, 0)}%`
        ),
        bullet("Estimasi Hujan", formatRainForecast(snapshot)),
      ]),
      inline: true,
    },
    {
      name: "🌦️ Kondisi Utama",
      value: joinLines([
        bullet("Suhu", `${formatNumber(snapshot.weather.temperature)}°C`),
        bullet("Kelembapan", `${formatNumber(snapshot.weather.humidity, 0)}%`),
        bullet("PM2.5", `${formatNumber(snapshot.airQuality.pm25)} µg/m³`),
        bullet("Hembusan angin", `${formatNumber(snapshot.weather.windGust)} km/jam`),
      ]),
      inline: true,
    },
    ...(bmkgField ? [bmkgField] : []),
    {
      name: "📄 Saran Hari Ini",
      value: truncateDiscordField(
        joinLines([
          plainBullet(buildPrimaryAction(snapshot, advice)),
          plainBullet(`Kelompok Sensitif: ${advice.sensitiveGroup}`),
        ]),
        700
      ),
      inline: false,
    },
  ];
}

export function createDailyReportEmbed(
  snapshot: AtmosSnapshot,
  advice: HealthAdvice,
  mode: ReportMode
): DiscordWebhookPayload {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);

  return {
    username: AppInfo.name,
    avatar_url: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
    embeds: [
      {
        title: `${AppInfo.name} | ${getModeTitle(mode)} ${snapshot.city}`,
        description: buildSummary(snapshot),
        color: resolveAqiColor(aqiLevel),
        fields: buildFields(snapshot, advice),
        footer: {
          text: "Informasi Bersifat Pemantauan Awal.",
        },
        timestamp: snapshot.generatedAt,
      },
    ],
  };
}