import type { AlertLevel } from "../entities/AlertLevel.js";

export function classifyAqi(aqi: number): AlertLevel {
  if (aqi <= 50) return "GOOD";
  if (aqi <= 100) return "MODERATE";
  if (aqi <= 150) return "UNHEALTHY_SENSITIVE";
  if (aqi <= 200) return "UNHEALTHY";
  if (aqi <= 300) return "VERY_UNHEALTHY";
  return "HAZARDOUS";
}

export function getAqiLabel(level: AlertLevel): string {
  const labels: Record<AlertLevel, string> = {
    GOOD: "Baik",
    MODERATE: "Sedang",
    UNHEALTHY_SENSITIVE: "Tidak Sehat Untuk Kelompok Sensitif",
    UNHEALTHY: "Tidak Sehat",
    VERY_UNHEALTHY: "Sangat Tidak Sehat",
    HAZARDOUS: "\u{1F480} Berbahaya",
  };

  return labels[level];
}

export function getAqiEmoji(level: AlertLevel): string {
  const emojis: Record<AlertLevel, string> = {
    GOOD: "\u{1F7E2}",
    MODERATE: "\u{1F7E1}",
    UNHEALTHY_SENSITIVE: "\u{1F7E0}",
    UNHEALTHY: "\u{1F534}",
    VERY_UNHEALTHY: "\u{1F7E3}",
    HAZARDOUS: "\u26AB",
  };

  return emojis[level];
}

export function getAqiDescription(level: AlertLevel): string {
  const descriptions: Record<AlertLevel, string> = {
    GOOD:
      "Udara Dalam Kondisi Bersih, Memenuhi Standar Kesehatan Global. Polusi Berada Pada Tingkat Minimum Tidak Ada Risiko Kesehatan Bagi Siapa Pun. Seluruh Lapisan Masyarakat, Termasuk Kelompok Sensitif, Aman Untuk Beraktivitas Di Luar Ruangan Secara Normal Tanpa Perlu Pembatasan.",
    MODERATE:
      "Kualitas Udara Masih Aman Untuk Sebagian Besar Populasi, Meski Ada Sedikit Kandungan Polutan. Sebagian Kecil Individu Yang Sangat Sensitif Terhadap Polusi Mungkin Mulai Merasakan Gejala Pernapasan Ringan. Masyarakat Umum Bisa Beraktivitas Seperti Biasa, Namun Kelompok Sensitif Disarankan Untuk Lebih Memperhatikan Kondisi Fisiknya Secara Mandiri.",
    UNHEALTHY_SENSITIVE:
      "Polusi Udara Berisiko Mengganggu Kelompok Rentan (Anak-Anak, Lansia, Ibu Hamil, Serta Penderita Asma Atau Gangguan Jantung). Sementara Masyarakat Umum Masih Relatif Aman. Kelompok Sensitif, Disarankan Untuk Mengurangi Aktivitas Fisik Yang Berat Atau Terlalu Lama Di Luar Ruangan, Mencegah Penurunan Fungsi Paru.",
    UNHEALTHY:
      "Kondisi Udara Tidak Sehat Bagi Semua Orang. Masyarakat Umum Dapat Mulai Merasakan Efek Polusi Seperti Iritasi Tenggorokan Atau Batuk, Sedangkan Dampak Pada Kelompok Sensitif Akan Terasa Lebih Berat. Sangat Disarankan Membatasi Aktivitas Di Luar Ruangan Dan Memakai Masker Respirator Standar (Seperti N95 Atau Setara) Jika Harus Keluar Rumah.",
    VERY_UNHEALTHY:
      "Tingkat Polusi Tinggi, Resiko Kesehatan Meningkat. Gangguan Fisik Serius Pada Seluruh Populasi. Semua Orang Diimbau Menghindari Aktivitas Luar Ruangan Yang Tidak Mendesak. Sebaiknya Pindahkan Aktivitas Ke Dalam Ruangan Yang Tertutup Dan Optimalkan Penggunaan Alat Penyaring Udara (Air Purifier).",
    HAZARDOUS:
      "Kondisi Darurat. Polusi Berbahaya Bagi Keselamatan Kesehatan. Semua Orang Berisiko Tinggi Mengalami Dampak Klinis Akut. Segala Aktivitas Di Luar Ruangan Harus Dihentikan Sepenuhnya. Tetaplah Berada Di Dalam Ruangan Dengan Ventilasi Tertutup Rapat, Segera Hubungi Fasilitas Medis Jika Muncul Gejala Sesak Napas Yang Parah.",
  };

  return descriptions[level];
}

export function isAqiDangerous(aqi: number): boolean {
  const level = classifyAqi(aqi);

  return (
    level === "UNHEALTHY" ||
    level === "VERY_UNHEALTHY" ||
    level === "HAZARDOUS"
  );
}

export function isAqiDrasticallyWorse(
  currentAqi: number,
  previousAqi?: number
): boolean {
  if (previousAqi === undefined) return false;

  return currentAqi - previousAqi >= 50;
}

export function isAqiCrossingUnsafeLevel(
  currentAqi: number,
  previousAqi?: number
): boolean {
  if (previousAqi === undefined) return false;

  return previousAqi <= 100 && currentAqi >= 101;
}
