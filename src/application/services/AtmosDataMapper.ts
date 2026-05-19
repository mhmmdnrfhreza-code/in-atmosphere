import type { WeatherReport } from "../../domain/entities/WeatherReport.js";
import type { AirQualityReport } from "../../domain/entities/AirQualityReport.js";
import type { ForecastSummary } from "../../domain/entities/ForecastSummary.js";
import type { OpenMeteoWeatherResponse } from "../../infrastructure/api/OpenMeteoWeatherClient.js";
import type { OpenMeteoAirQualityResponse } from "../../infrastructure/api/OpenMeteoAirQualityClient.js";

function safeNumber(value: number | undefined, fallback = 0): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function isMeaningfulRainWindow(
  probability: number | undefined,
  precipitation: number | undefined
): boolean {
  return safeNumber(probability) >= 50 || safeNumber(precipitation) > 0;
}

function findNextRainWindow(
  weatherResponse: OpenMeteoWeatherResponse
): { time: string | null; probability: number | null } {
  const times = weatherResponse.hourly?.time ?? [];
  const probabilities = weatherResponse.hourly?.precipitation_probability ?? [];
  const precipitation = weatherResponse.hourly?.precipitation ?? [];

  const index = times.findIndex((time, itemIndex) => {
    return Boolean(time) && isMeaningfulRainWindow(
      probabilities[itemIndex],
      precipitation[itemIndex]
    );
  });

  if (index === -1) {
    return {
      time: null,
      probability: null,
    };
  }

  return {
    time: times[index],
    probability: safeNumber(probabilities[index]),
  };
}

function findPeakRainTime(weatherResponse: OpenMeteoWeatherResponse): string | null {
  const times = weatherResponse.hourly?.time ?? [];
  const probabilities = weatherResponse.hourly?.precipitation_probability ?? [];

  if (times.length === 0 || probabilities.length === 0) {
    return null;
  }

  const peak = probabilities.reduce(
    (currentPeak, probability, index) => {
      return safeNumber(probability) > currentPeak.probability
        ? { index, probability: safeNumber(probability) }
        : currentPeak;
    },
    { index: -1, probability: 0 }
  );

  if (peak.index === -1 || peak.probability < 50) {
    return null;
  }

  return times[peak.index] ?? null;
}

export function mapWeatherReport(
  weatherResponse: OpenMeteoWeatherResponse
): WeatherReport {
  return {
    temperature: safeNumber(weatherResponse.current.temperature_2m),
    humidity: safeNumber(weatherResponse.current.relative_humidity_2m),
    precipitation: safeNumber(weatherResponse.current.precipitation),
    rain: safeNumber(weatherResponse.current.rain),
    windSpeed: safeNumber(weatherResponse.current.wind_speed_10m),
    windGust: safeNumber(weatherResponse.current.wind_gusts_10m),
    weatherCode: safeNumber(weatherResponse.current.weather_code),
  };
}

export function mapAirQualityReport(
  airQualityResponse: OpenMeteoAirQualityResponse
): AirQualityReport {
  return {
    usAqi: safeNumber(airQualityResponse.current.us_aqi),
    pm25: safeNumber(airQualityResponse.current.pm2_5),
    pm10: safeNumber(airQualityResponse.current.pm10),
    carbonMonoxide: safeNumber(airQualityResponse.current.carbon_monoxide),
    nitrogenDioxide: safeNumber(airQualityResponse.current.nitrogen_dioxide),
    sulphurDioxide: safeNumber(airQualityResponse.current.sulphur_dioxide),
    ozone: safeNumber(airQualityResponse.current.ozone),
    uvIndex: safeNumber(airQualityResponse.current.uv_index),
  };
}

export function mapForecastSummary(
  weatherResponse: OpenMeteoWeatherResponse
): ForecastSummary {
  const nextRainWindow = findNextRainWindow(weatherResponse);

  return {
    maxTemperature: safeNumber(weatherResponse.daily.temperature_2m_max[0]),
    minTemperature: safeNumber(weatherResponse.daily.temperature_2m_min[0]),
    maxPrecipitationProbability: safeNumber(
      weatherResponse.daily.precipitation_probability_max[0]
    ),
    nextRainTime: nextRainWindow.time,
    nextRainProbability: nextRainWindow.probability,
    peakRainTime: findPeakRainTime(weatherResponse),
    maxUvIndex: safeNumber(weatherResponse.daily.uv_index_max[0]),
  };
}
