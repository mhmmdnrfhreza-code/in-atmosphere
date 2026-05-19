export interface EmergencyThresholds {
  dangerousAqi: number;
  drasticAqiIncrease: number;
  extremeUv: number;
  heavyRain: number;
  strongWindGust: number;
  highRainProbability: number;
}

export const DefaultEmergencyThresholds: EmergencyThresholds = {
  dangerousAqi: 151,
  drasticAqiIncrease: 50,
  extremeUv: 11,
  heavyRain: 10,
  strongWindGust: 45,
  highRainProbability: 85,
};