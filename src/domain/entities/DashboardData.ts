import type { ReportMode } from "./ReportMode.js";
import type {
  EmergencyAlertType,
  EmergencySeverity,
} from "./EmergencyAlert.js";

export interface DashboardData {
  appName: string;
  city: string;
  generatedAt: string;
  reportMode: ReportMode;

  overallStatus: {
    label: string;
    description: string;
    level: "good" | "moderate" | "warning" | "danger";
  };

  weather: {
    temperature: number;
    humidity: number;
    rain: number;
    windSpeed: number;
    windGust: number;
  };

  airQuality: {
    usAqi: number;
    aqiLabel: string;
    aqiEmoji: string;
    pm25: number;
    pm10: number;
    ozone: number;
  };

  uv: {
    current: number;
    maxToday: number;
    label: string;
    emoji: string;
    advice: string;
  };

  forecast: {
    minTemperature: number;
    maxTemperature: number;
    maxPrecipitationProbability: number;
    nextRainTime: string | null;
    nextRainProbability: number | null;
    peakRainTime: string | null;
  };

  emergency: {
    shouldSend: boolean;
    type: EmergencyAlertType | null;
    severity: EmergencySeverity | null;
    title: string;
    reasons: string[];
  };

  advice: {
    general: string;
    outdoor: string;
    sensitiveGroup: string;
  };

  bmkgWarning: {
    isActive: boolean;
    title: string | null;
    description: string | null;
    publishedAt: string | null;
    matchedKeywords: string[];
  };

  sources: string[];
}
