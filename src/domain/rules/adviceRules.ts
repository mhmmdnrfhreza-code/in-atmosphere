import type { HealthAdvice } from "../entities/HealthAdvice.js";
import type { AlertLevel } from "../entities/AlertLevel.js";
import type { UvLevel } from "./uvRules.js";

export function buildHealthAdvice(
  aqiLevel: AlertLevel,
  uvLevel: UvLevel,
  rainProbability: number
): HealthAdvice {
  const advice: HealthAdvice = {
    general: "Kondisi Umum Masih Dapat Dipantau Secara Normal.",
    outdoor: "Aktivitas Luar Ruangan Masih Dapat Dilakukan Dengan Memperhatikan Kondisi Sekitar.",
    sensitiveGroup:
      "Kelompok Sensitif Tetap Disarankan Memperhatikan Gejala Seperti Sesak, Batuk, Atau Iritasi.",
  };

  if (
    aqiLevel === "UNHEALTHY" ||
    aqiLevel === "VERY_UNHEALTHY" ||
    aqiLevel === "HAZARDOUS"
  ) {
    advice.general =
      "Kualitas Udara Sedang Tidak Sehat. Kurangi Paparan Udara Luar Jika Memungkinkan.";
    advice.outdoor =
      "Kurangi Aktivitas Luar Ruangan Berat Dan Pertimbangkan Memakai Masker.";
    advice.sensitiveGroup =
      "Anak-Anak, Lansia, Dan Orang Dengan Gangguan Pernapasan Sebaiknya Berada Di Dalam Ruangan.";
  } else if (aqiLevel === "UNHEALTHY_SENSITIVE") {
    advice.general =
      "Kualitas Udara Mulai Kurang Baik Untuk Kelompok Sensitif.";
    advice.outdoor =
      "Aktivitas Luar Ruangan Masih Bisa Dilakukan, Tetapi Jangan Terlalu Lama.";
    advice.sensitiveGroup =
      "Kelompok Sensitif Sebaiknya Mengurangi Aktivitas Luar Ruangan Berat.";
  }

  if (uvLevel === "VERY_HIGH" || uvLevel === "EXTREME") {
    advice.outdoor +=
      " UV Sedang Tinggi, Gunakan Sunscreen, Topi, dan Hindari Paparan Matahari Langsung Terlalu Lama.";
  }

  if (rainProbability >= 70) {
    advice.general += " Ada Peluang Hujan Cukup Tinggi, Siapkan Payung/Jas Hujan.";
  }

  return advice;
}