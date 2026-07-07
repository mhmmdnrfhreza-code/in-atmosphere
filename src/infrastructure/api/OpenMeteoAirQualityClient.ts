import axios from "axios";
import { MonitoredLocation } from "../config/location.js";

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
      latitude: MonitoredLocation.latitude,
      longitude: MonitoredLocation.longitude,
      timezone: MonitoredLocation.timezone,
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