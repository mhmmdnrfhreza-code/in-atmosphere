import dayjs from "dayjs";

export function formatDateTime(date: Date = new Date()): string {
  return dayjs(date).format("DD MMMM YYYY HH:mm");
}

export function toIsoString(date: Date = new Date()): string {
  return date.toISOString();
}