import axios from "axios";

export interface AdministrativeArea {
  city: string;
  province: string;
  suburb: string;
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const HTTP_HEADERS = {
  "User-Agent": "In-Atmosphere-Monitor/1.0 (https://github.com/mhmmdnrfhreza-code/in-atmosphere)",
  "Accept-Language": "id",
};

export async function getAdministrativeArea(
  lat: number,
  lon: number
): Promise<AdministrativeArea> {
  const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`;

  try {
    const response = await axios.get(url, {
      headers: HTTP_HEADERS,
      timeout: 10000,
    });

    const address = response.data?.address || {};

    // Nominatim returns various keys for city depending on administrative level
    const city =
      address.city ||
      address.municipality ||
      address.town ||
      address.county ||
      address.region ||
      "Kota Tidak Diketahui";

    const province = address.state || address.province || "Provinsi Tidak Diketahui";
    
    // Suburb is typically kecamatan in Indonesia
    const suburb = 
      address.suburb || 
      address.village || 
      address.district || 
      "Kecamatan Tidak Diketahui";

    return { city, province, suburb };
  } catch (error) {
    console.error("Gagal mendapatkan administrative area dari Nominatim:", error);
    return {
      city: "Kota Tidak Diketahui",
      province: "Provinsi Tidak Diketahui",
      suburb: "Kecamatan Tidak Diketahui",
    };
  }
}

export async function getNearbySuburbs(
  lat: number,
  lon: number,
  radiusKm: number
): Promise<string[]> {
  const degreeRadius = (radiusKm / 111) / 1.5; // sample points slightly inside the radius

  const points = [
    { lat: lat + degreeRadius, lon }, // North
    { lat: lat - degreeRadius, lon }, // South
    { lat, lon: lon + degreeRadius }, // East
    { lat, lon: lon - degreeRadius }, // West
  ];

  const suburbs = new Set<string>();

  for (const point of points) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const area = await getAdministrativeArea(point.lat, point.lon);
    if (area.suburb && area.suburb !== "Kecamatan Tidak Diketahui") {
      suburbs.add(area.suburb);
    }
  }

  return [...suburbs];
}
