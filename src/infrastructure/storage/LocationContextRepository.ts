import { readJsonFile, writeJsonFile } from "./JsonFileStorage.js";
import { MonitoredLocation } from "../config/location.js";
import {
  getAdministrativeArea,
  getNearbySuburbs,
} from "../api/GeocodingClient.js";

const LOCATION_CONTEXT_FILE_PATH = "data/location_context.json";

export interface LocationContext {
  latitude: number;
  longitude: number;
  radiusKm: number;
  city: string;
  province: string;
  suburb: string;
  nearbySuburbs: string[];
  resolvedAt: string;
}

export async function getLocationContext(): Promise<LocationContext> {
  const { latitude, longitude, kecamatanRadiusKm } = MonitoredLocation;
  
  let cached: LocationContext | null = null;
  try {
    cached = await readJsonFile<LocationContext>(LOCATION_CONTEXT_FILE_PATH, null as any);
  } catch {
    // File not found or invalid
  }

  // If cache is valid and coordinates/radius haven't changed, return cache
  if (
    cached &&
    cached.latitude === latitude &&
    cached.longitude === longitude &&
    cached.radiusKm === kecamatanRadiusKm &&
    cached.resolvedAt
  ) {
    return cached;
  }

  console.log("Memperbarui konteks lokasi dari API Geocoding (Nominatim)...");
  
  const adminArea = await getAdministrativeArea(latitude, longitude);
  const nearby = await getNearbySuburbs(latitude, longitude, kecamatanRadiusKm);

  // Combine target suburb and nearby suburbs, removing exact duplicates
  const allSuburbs = [...new Set([adminArea.suburb, ...nearby])];

  const newContext: LocationContext = {
    latitude,
    longitude,
    radiusKm: kecamatanRadiusKm,
    city: adminArea.city,
    province: adminArea.province,
    suburb: adminArea.suburb,
    nearbySuburbs: allSuburbs,
    resolvedAt: new Date().toISOString(),
  };

  await writeJsonFile<LocationContext>(LOCATION_CONTEXT_FILE_PATH, newContext);
  console.log(`Berhasil memetakan lokasi: ${adminArea.suburb}, ${adminArea.city}. Ditemukan ${allSuburbs.length} kecamatan terkait.`);
  
  return newContext;
}
