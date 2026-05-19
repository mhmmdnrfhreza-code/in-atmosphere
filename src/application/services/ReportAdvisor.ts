import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import type { HealthAdvice } from "../../domain/entities/HealthAdvice.js";
import { classifyAqi } from "../../domain/rules/airQualityRules.js";
import { buildHealthAdvice } from "../../domain/rules/adviceRules.js";
import { classifyUvIndex } from "../../domain/rules/uvRules.js";

export function createHealthAdvice(snapshot: AtmosSnapshot): HealthAdvice {
  const aqiLevel = classifyAqi(snapshot.airQuality.usAqi);
  const uvLevel = classifyUvIndex(snapshot.airQuality.uvIndex);

  return buildHealthAdvice(
    aqiLevel,
    uvLevel,
    snapshot.forecast.maxPrecipitationProbability
  );
}