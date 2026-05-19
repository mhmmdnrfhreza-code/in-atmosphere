import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type { DashboardData } from "../../domain/entities/DashboardData.js";
import type { EmergencyAlert } from "../../domain/entities/EmergencyAlert.js";
import type { HealthAdvice } from "../../domain/entities/HealthAdvice.js";
import type { ReportMode } from "../../domain/entities/ReportMode.js";
import {
  classifyAqi,
  getAqiEmoji,
  getAqiLabel,
} from "../../domain/rules/airQualityRules.js";
import {
  classifyUvIndex,
  getUvAdvice,
  getUvEmoji,
  getUvLabel,
} from "../../domain/rules/uvRules.js";
import { AppInfo } from "../../shared/constants/appInfo.js";

function resolveOverallStatus(
  snapshot: AtmosSnapshot,
  emergencyAlert: EmergencyAlert
): DashboardData["overallStatus"] {
  if (emergencyAlert.shouldSend) {
    return {
      label: "Perlu Perhatian",
      description:
        "Sistem mendeteksi kondisi yang perlu diperhatikan. Lihat bagian emergency dan saran praktis.",
      level: emergencyAlert.severity === "DANGER" ? "danger" : "warning",
    };
  }

  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);

  if (aqiLevel === "GOOD") {
    return {
      label: "Aman",
      description:
        "Kondisi umum relatif aman. Tetap pantau cuaca dan kualitas udara sebelum beraktivitas.",
      level: "good",
    };
  }

  if (aqiLevel === "MODERATE") {
    return {
      label: "Sedang",
      description:
        "Kondisi masih dapat diterima, tetapi kelompok sensitif tetap perlu memperhatikan kondisi tubuh.",
      level: "moderate",
    };
  }

  return {
    label: "Waspada",
    description:
      "Kualitas udara atau kondisi lingkungan mulai kurang baik. Kurangi paparan luar ruangan jika diperlukan.",
    level: "warning",
  };
}

export function createDashboardData(
  snapshot: AtmosSnapshot,
  emergencyAlert: EmergencyAlert,
  advice: HealthAdvice,
  reportMode: ReportMode
): DashboardData {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);
  const uvLevel = classifyUvIndex(snapshot.airQuality.uvIndex);

  return {
    appName: AppInfo.name,
    city: snapshot.city,
    generatedAt: snapshot.generatedAt,
    reportMode,

    overallStatus: resolveOverallStatus(snapshot, emergencyAlert),

    weather: {
      temperature: snapshot.weather.temperature,
      humidity: snapshot.weather.humidity,
      rain: snapshot.weather.rain,
      windSpeed: snapshot.weather.windSpeed,
      windGust: snapshot.weather.windGust,
    },

    airQuality: {
      usAqi: snapshot.airQuality.usAqi,
      aqiLabel: getAqiLabel(aqiLevel),
      aqiEmoji: getAqiEmoji(aqiLevel),
      pm25: snapshot.airQuality.pm25,
      pm10: snapshot.airQuality.pm10,
      ozone: snapshot.airQuality.ozone,
    },

    uv: {
      current: snapshot.airQuality.uvIndex,
      maxToday: snapshot.forecast.maxUvIndex,
      label: getUvLabel(uvLevel),
      emoji: getUvEmoji(uvLevel),
      advice: getUvAdvice(uvLevel),
    },

    forecast: {
      minTemperature: snapshot.forecast.minTemperature,
      maxTemperature: snapshot.forecast.maxTemperature,
      maxPrecipitationProbability:
        snapshot.forecast.maxPrecipitationProbability,
      nextRainTime: snapshot.forecast.nextRainTime,
      nextRainProbability: snapshot.forecast.nextRainProbability,
      peakRainTime: snapshot.forecast.peakRainTime,
    },

    emergency: {
      shouldSend: emergencyAlert.shouldSend,
      type: emergencyAlert.type,
      severity: emergencyAlert.severity,
      title: emergencyAlert.title,
      reasons: emergencyAlert.reasons,
    },

    advice: {
      general: advice.general,
      outdoor: advice.outdoor,
      sensitiveGroup: advice.sensitiveGroup,
    },

    bmkgWarning: {
      isActive: snapshot.bmkgWarning.isActive,
      title: snapshot.bmkgWarning.title,
      description: snapshot.bmkgWarning.description,
      publishedAt: snapshot.bmkgWarning.publishedAt,
      matchedKeywords: snapshot.bmkgWarning.matchedKeywords,
    },

    sources: [
      "Open-Meteo Weather API",
      "Open-Meteo Air Quality API",
      "BMKG Peringatan Dini Cuaca",
      "In Atmosphere Rule Engine",
    ],
  };
}
