import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import { BogorLocation } from "../../domain/value-objects/BogorLocation.js";
import { fetchOpenMeteoWeather } from "../../infrastructure/api/OpenMeteoWeatherClient.js";
import { fetchOpenMeteoAirQuality } from "../../infrastructure/api/OpenMeteoAirQualityClient.js";
import { fetchBmkgNowcastWarnings } from "../../infrastructure/api/BmkgWarningClient.js";
import {
  mapAirQualityReport,
  mapForecastSummary,
  mapWeatherReport,
} from "../services/AtmosDataMapper.js";
import { mapBmkgWarning } from "../services/BmkgWarningMapper.js";
import { toIsoString } from "../../shared/utils/dateFormatter.js";

export async function getInAtmosphereSnapshot(): Promise<AtmosSnapshot> {
  const [weatherResponse, airQualityResponse, bmkgWarningItems] =
    await Promise.all([
      fetchOpenMeteoWeather(),
      fetchOpenMeteoAirQuality(),
      fetchBmkgNowcastWarnings().catch((error) => {
        console.warn("Gagal mengambil warning BMKG:", error.message);
        return [];
      }),
    ]);

  return {
    city: BogorLocation.city,
    generatedAt: toIsoString(),
    weather: mapWeatherReport(weatherResponse),
    airQuality: mapAirQualityReport(airQualityResponse),
    forecast: mapForecastSummary(weatherResponse),
    bmkgWarning: mapBmkgWarning(bmkgWarningItems),
  };
}
