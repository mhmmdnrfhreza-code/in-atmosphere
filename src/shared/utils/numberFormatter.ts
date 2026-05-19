export function roundNumber(value: number, digits = 1): number {
  return Number(value.toFixed(digits));
}

export function formatNumber(value: number, digits = 1): string {
  return roundNumber(value, digits).toString();
}

export function formatOptionalNumber(
  value: number | undefined | null,
  digits = 1,
  fallback = "-"
): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return fallback;
  }

  return formatNumber(value, digits);
}