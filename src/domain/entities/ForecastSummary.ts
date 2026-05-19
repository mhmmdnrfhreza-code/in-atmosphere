export interface ForecastSummary {
  maxTemperature: number;
  minTemperature: number;
  maxPrecipitationProbability: number;
  nextRainTime: string | null;
  nextRainProbability: number | null;
  peakRainTime: string | null;
  maxUvIndex: number;
}
