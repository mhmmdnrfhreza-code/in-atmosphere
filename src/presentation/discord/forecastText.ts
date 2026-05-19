import type { AtmosSnapshot } from "../../domain/entities/AtmosSnapshot.js";
import { formatNumber } from "../../shared/utils/numberFormatter.js";

function formatForecastTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);

  return `${time} WIB`;
}

export function formatRainForecast(snapshot: AtmosSnapshot): string {
  if (!snapshot.forecast.nextRainTime) {
    return "Belum ada jendela hujan signifikan";
  }

  const probability = snapshot.forecast.nextRainProbability;
  const probabilityText =
    probability === null
      ? ""
      : ` (${formatNumber(probability, 0)}%)`;
  const peakText = snapshot.forecast.peakRainTime
    ? `, puncak sekitar ${formatForecastTime(snapshot.forecast.peakRainTime)}`
    : "";

  return `${formatForecastTime(snapshot.forecast.nextRainTime)}${probabilityText}${peakText}`;
}
