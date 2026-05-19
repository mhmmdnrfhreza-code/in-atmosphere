import axios from "axios";
import { BogorLocation } from "../../domain/value-objects/BogorLocation.js";

export interface OpenMeteoWeatherResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
  };
  hourly: {
    time: string[];
    precipitation_probability: number[];
    precipitation: number[];
  };
}

export async function fetchOpenMeteoWeather(): Promise<OpenMeteoWeatherResponse> {
  const url = "https://api.open-meteo.com/v1/forecast";

  const response = await axios.get<OpenMeteoWeatherResponse>(url, {
    params: {
      latitude: BogorLocation.latitude,
      longitude: BogorLocation.longitude,
      timezone: BogorLocation.timezone,
      forecast_days: 2,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "rain",
        "weather_code",
        "wind_speed_10m",
        "wind_gusts_10m",
      ].join(","),
      daily: [
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "uv_index_max",
      ].join(","),
      hourly: [
        "precipitation_probability",
        "precipitation",
      ].join(","),
    },
  });

  return response.data;
}
