export type UvLevel = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | "EXTREME";

export function classifyUvIndex(uvIndex: number): UvLevel {
  if (uvIndex < 3) return "LOW";
  if (uvIndex < 6) return "MODERATE";
  if (uvIndex < 8) return "HIGH";
  if (uvIndex < 11) return "VERY_HIGH";
  return "EXTREME";
}

export function getUvLabel(level: UvLevel): string {
  const labels: Record<UvLevel, string> = {
    LOW: "Rendah",
    MODERATE: "Sedang",
    HIGH: "Tinggi",
    VERY_HIGH: "Sangat Tinggi",
    EXTREME: "\u{1F525} Ekstrem",
  };

  return labels[level];
}

export function getUvEmoji(level: UvLevel): string {
  const emojis: Record<UvLevel, string> = {
    LOW: "\u{1F7E2}",
    MODERATE: "\u{1F7E1}",
    HIGH: "\u{1F7E0}",
    VERY_HIGH: "\u{1F534}",
    EXTREME: "\u{1F7E3}",
  };

  return emojis[level];
}

export function getUvAdvice(level: UvLevel): string {
  const advice: Record<UvLevel, string> = {
    LOW:
      "Indeks Radiasi UV Berada Pada Tingkat Minimum. Risiko Kerusakan Kulit Sangat Rendah Bagi Mayoritas Orang. Aman Untuk Beraktivitas Normal Di Luar Ruangan Tanpa Perlindungan Khusus. Namun, Bagi Individu Dengan Kulit Yang Sangat Sensitif Atau Jika Harus Berada Di Bawah Terik Matahari Dalam Durasi Yang Sangat Lama, Penggunaan Kacamata Hitam, Penggunaan Tabir Surya (Sunscreen) Dengan Proteksi Minimal Terhadap UV-A dan UV-B (SPF 15+) Tetap Disarankan.",
    MODERATE:
      "Paparan Radiasi UV Sedang. Berpotensi Menimbulkan Kerusakan Pada Sel Kulit Jika Terpapar Langsung Dalam Jangka Waktu Tertentu. Diperlukan Proteksi Dasar Saat Beraktivitas Di Luar Ruangan (Mengoleskan Tabir Surya (Sunscreen) Dengan SPF Dan Peringkat Minimal 15 - 30 PA++, Memakai Topi, Dan Menggunakan Pelindung Mata. Disarankan Juga Untuk Mencari Tempat Berteduh Saat Intensitas Matahari Mencapai Puncaknya Di Paruh Hari.",
    HIGH:
      "Tingkat Radiasi UV Tinggi. Berisiko Mempercepat Terjadinya Luka Bakar Matahari (Sunburn) Serta Kerusakan Kulit Jangka Panjang. Perlindungan Aktif Sangat Penting Diterapkan (Mengoleskan Tabir Surya (Sunscreen) Dengan Minimal SPF Dan Peringkat 30+ PA+++, Pakaian Pelindung, Dan Kacamata Anti-UV). Batasi Paparan Matahari Langsung Secara Signifikan, Terutama Antara Pukul 10.00 WIB - 16.00 WIB, Utamakan Melakukan Aktivitas Di Area Yang Teduh.",
    VERY_HIGH:
      "Radiasi UV Kritis. Dapat Merusak Jaringan Kulit Dan Mata Dalam Waktu Singkat Tanpa Perlindungan Ekstra. Meminimalkan Aktivitas Luar Ruangan Selama Jam-Jam Puncak Radiasi. Jika Harus Keluar Rumah, Wajib Menggunakan Perlindungan Maksimal (Pakaian Tertutup, Topi Bertepi Lebar, Kacamata Hitam Yang Memblokir Sinar UV, Serta Mengoleskan Kembali Tabir Surya (Sunscreen) Dengan SPF Dan Peringkat 30+ - 50+ PA++++ Secara Berkala Setiap Dua Jam).",
    EXTREME:
      "Kondisi Bahaya. Tingkat Ekstrem. Radiasi Matahari Menyebabkan Kerusakan Akut Pada Kulit Dan Kornea Mata Dalam Hitungan Menit. Sangat Disarankan Menghindari Paparan Matahari Langsung Dan Tetap Berada Di Dalam Ruangan. Jika Terpaksa Beraktivitas Di Luar, Perlindungan Medis Maksimal Bersifat Mandatori, Termasuk Penutupan Kulit Secara Menyeluruh Dan Penggunaan Tabir Surya (Sunscreen) Dosis Tinggi (SPF 50+/100 PA++++).",
  };

  return advice[level];
}

export function isUvDangerous(uvIndex: number): boolean {
  return uvIndex >= 8;
}

export function isUvExtreme(uvIndex: number): boolean {
  return uvIndex >= 11;
}
