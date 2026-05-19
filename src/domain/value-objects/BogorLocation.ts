export const BogorLocation = {
  city: "Kota Bogor",
  province: "Jawa Barat",
  country: "Indonesia",
  latitude: Number(process.env.BOGOR_LAT ?? -6.5963564),
  longitude: Number(process.env.BOGOR_LON ?? 106.7973188),
  timezone: "Asia/Jakarta",
} as const;