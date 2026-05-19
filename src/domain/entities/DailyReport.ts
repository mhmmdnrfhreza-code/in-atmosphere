import type { WeatherReport } from "./WeatherReport.js";
import type { AirQualityReport } from "./AirQualityReport.js";

export interface DailyReport {
  city: string;
  mode: "morning" | "rush-hour" | "manual";
  generatedAt: string;
  weather: WeatherReport;
  airQuality: AirQualityReport;
  summary: string;
  advice: string;
}