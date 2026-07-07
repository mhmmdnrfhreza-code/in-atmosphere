import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export interface MonitoredLocationConfig {
  latitude: number;
  longitude: number;
  timezone: string;
  kecamatanRadiusKm: number;
}

const LOCATION_FILE_PATH = resolve("data/location.json");

const defaults: MonitoredLocationConfig = {
  latitude: -6.5963564,
  longitude: 106.7973188,
  timezone: "Asia/Jakarta",
  kecamatanRadiusKm: 10,
};

function loadLocationConfig(): MonitoredLocationConfig {
  if (!existsSync(LOCATION_FILE_PATH)) {
    console.warn(
      "data/location.json tidak ditemukan, menggunakan lokasi default."
    );
    return defaults;
  }

  try {
    const raw = readFileSync(LOCATION_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);

    return {
      latitude: Number(parsed.latitude ?? defaults.latitude),
      longitude: Number(parsed.longitude ?? defaults.longitude),
      timezone: parsed.timezone ?? defaults.timezone,
      kecamatanRadiusKm: Number(parsed.kecamatanRadiusKm ?? defaults.kecamatanRadiusKm),
    };
  } catch {
    console.warn(
      "Gagal membaca data/location.json, menggunakan lokasi default."
    );
    return defaults;
  }
}

export const MonitoredLocation: Readonly<MonitoredLocationConfig> =
  loadLocationConfig();
