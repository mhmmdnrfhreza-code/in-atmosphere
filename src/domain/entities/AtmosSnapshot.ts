import type { WeatherReport } from "./WeatherReport.js";
import type { AirQualityReport } from "./AirQualityReport.js";
import type { ForecastSummary } from "./ForecastSummary.js";
import type { BmkgWarning } from "./BmkgWarning.js";

export interface AtmosSnapshot {
  city: string;
  generatedAt: string;
  weather: WeatherReport;
  airQuality: AirQualityReport;
  forecast: ForecastSummary;
  bmkgWarning: BmkgWarning;
}