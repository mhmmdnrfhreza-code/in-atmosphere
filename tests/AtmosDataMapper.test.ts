import { describe, expect, it } from "vitest";
import type { OpenMeteoWeatherResponse } from "../src/infrastructure/api/OpenMeteoWeatherClient.js";
import { mapForecastSummary } from "../src/application/services/AtmosDataMapper.js";

function createWeatherResponse(
  overrides: Partial<OpenMeteoWeatherResponse> = {}
): OpenMeteoWeatherResponse {
  return {
    current: {
      temperature_2m: 28,
      relative_humidity_2m: 80,
      precipitation: 0,
      rain: 0,
      weather_code: 3,
      wind_speed_10m: 8,
      wind_gusts_10m: 12,
    },
    daily: {
      temperature_2m_max: [31],
      temperature_2m_min: [24],
      precipitation_probability_max: [80],
      uv_index_max: [8],
    },
    hourly: {
      time: [
        "2026-05-18T08:00",
        "2026-05-18T09:00",
        "2026-05-18T10:00",
      ],
      precipitation_probability: [20, 65, 80],
      precipitation: [0, 0.2, 1.4],
    },
    ...overrides,
  };
}

describe("mapForecastSummary", () => {
  it("maps next and peak rain timing from hourly forecast", () => {
    const forecast = mapForecastSummary(createWeatherResponse());

    expect(forecast.nextRainTime).toBe("2026-05-18T09:00");
    expect(forecast.nextRainProbability).toBe(65);
    expect(forecast.peakRainTime).toBe("2026-05-18T10:00");
  });

  it("falls back to null timing when no meaningful rain window exists", () => {
    const forecast = mapForecastSummary(
      createWeatherResponse({
        hourly: {
          time: ["2026-05-18T08:00"],
          precipitation_probability: [20],
          precipitation: [0],
        },
      })
    );

    expect(forecast.nextRainTime).toBeNull();
    expect(forecast.nextRainProbability).toBeNull();
    expect(forecast.peakRainTime).toBeNull();
  });
});
