import axios from "axios";
import { BogorLocation } from "../../domain/value-objects/BogorLocation.js";

export interface OpenMeteoAirQualityResponse {
  current: {
    pm10: number;
    pm2_5: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    ozone: number;
    us_aqi: number;
    uv_index: number;
  };
}

export async function fetchOpenMeteoAirQuality(): Promise<OpenMeteoAirQualityResponse> {
  const url = "https://air-quality-api.open-meteo.com/v1/air-quality";

  const response = await axios.get<OpenMeteoAirQualityResponse>(url, {
    params: {
      latitude: BogorLocation.latitude,
      longitude: BogorLocation.longitude,
      timezone: BogorLocation.timezone,
      forecast_days: 2,
      current: [
        "pm10",
        "pm2_5",
        "carbon_monoxide",
        "nitrogen_dioxide",
        "sulphur_dioxide",
        "ozone",
        "us_aqi",
        "uv_index",
      ].join(","),
    },
  });

  return response.data;
}