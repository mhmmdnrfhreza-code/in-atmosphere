import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type {
  EmergencyAlert,
  EmergencyAlertType,
  EmergencySeverity,
} from "../../domain/entities/EmergencyAlert.js";
import {
  isAqiCrossingUnsafeLevel,
  isAqiDangerous,
  isAqiDrasticallyWorse,
} from "../../domain/rules/airQualityRules.js";
import { isUvExtreme } from "../../domain/rules/uvRules.js";
import {
  isHeavyRain,
  isHighRainProbability,
  isStrongWindGust,
} from "../../domain/rules/weatherRiskRules.js";

interface EmergencyAnalyzerInput {
  snapshot: AtmosSnapshot;
  previousAqi?: number;
}

function detectAlertType(reasons: string[]): EmergencyAlertType | null {
  const hasAir = reasons.some((reason) => reason.includes("AQI"));
  const hasUv = reasons.some((reason) => reason.includes("UV"));
  const hasRain = reasons.some((reason) => reason.includes("hujan"));
  const hasWind = reasons.some((reason) => reason.includes("angin"));
  const hasBmkg = reasons.some((reason) => reason.includes("BMKG"));

  const activeTypes = [hasAir, hasUv, hasRain, hasWind, hasBmkg].filter(Boolean).length;

  if (activeTypes > 1) return "MULTI_RISK";
  if (hasAir) return "AIR_QUALITY";
  if (hasUv) return "UV";
  if (hasRain || hasBmkg) return "HEAVY_RAIN";
  if (hasWind) return "STRONG_WIND";

  return null;
}

function detectSeverity(snapshot: AtmosSnapshot): EmergencySeverity {
  const aqi = snapshot.airQuality.usAqi;
  const uv = snapshot.airQuality.uvIndex;

  if (aqi >= 201 || uv >= 11) return "DANGER";
  if (aqi >= 151 || snapshot.weather.rain >= 10) return "WARNING";

  return "WATCH";
}

export function analyzeEmergency(input: EmergencyAnalyzerInput): EmergencyAlert {
  const { snapshot, previousAqi } = input;

  const reasons: string[] = [];

  if (isAqiDangerous(snapshot.airQuality.usAqi)) {
    reasons.push(`AQI Mencapai ${snapshot.airQuality.usAqi}, Masuk Kategori Tidak Sehat Atau Lebih Buruk.`);
  }

  if (isAqiDrasticallyWorse(snapshot.airQuality.usAqi, previousAqi)) {
    reasons.push(
      `AQI Naik Drastis Dari ${previousAqi} Ke ${snapshot.airQuality.usAqi}.`
    );
  }

  if (isAqiCrossingUnsafeLevel(snapshot.airQuality.usAqi, previousAqi)) {
    reasons.push(
      `AQI Berubah Dari Level Aman/Sedang Menjadi Tidak Sehat Untuk Kelompok Sensitif.`
    );
  }

  if (isUvExtreme(snapshot.airQuality.uvIndex)) {
    reasons.push(`UV Index Mencapai ${snapshot.airQuality.uvIndex}, Masuk Kategori Ekstrem.`);
  }

  if (isHeavyRain(snapshot.weather.rain)) {
    reasons.push(`Intensitas Hujan Saat Ini Mencapai ${snapshot.weather.rain} mm.`);
  }

  if (isHighRainProbability(snapshot.forecast.maxPrecipitationProbability)) {
    reasons.push(
      `Peluang Hujan Hari Ini Mencapai ${snapshot.forecast.maxPrecipitationProbability}%.`
    );
  }

  if (isStrongWindGust(snapshot.weather.windGust)) {
    reasons.push(`Hembusan Angin Mencapai ${snapshot.weather.windGust} km/jam.`);
  }

  if (snapshot.bmkgWarning.isActive) {
    reasons.push(
      `BMKG mengeluarkan peringatan dini cuaca yang relevan dengan ${snapshot.city}: ${snapshot.bmkgWarning.title}.`
    );
  }

  const shouldSend = reasons.length > 0;
  const type = detectAlertType(reasons);
  const severity = shouldSend ? detectSeverity(snapshot) : null;

  return {
    shouldSend,
    type,
    severity,
    title: shouldSend
      ? "🚨 Emergency Alert"
      : "Tidak Ada Emergency Alert",
    message: shouldSend
      ? "Sistem Mendeteksi Kondisi Yang Perlu Diperhatikan."
      : "Kondisi Masih Dalam Pemantauan Normal.",
    reasons,
  };
}