import { safeNumber } from "./formatters.js";

export function getFreshness(value) {
  if (!value) {
    return {
      label: "Belum Tersedia",
      level: "critical",
      description: "Data belum tersedia.",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      label: "Waktu Invalid",
      level: "critical",
      description: "Format waktu data tidak valid.",
    };
  }

  const diffHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 2) {
    return {
      label: "Online",
      level: "good",
      description: "Sinkronisasi data berjalan normal.",
    };
  }

  if (diffHours < 6) {
    return {
      label: "Perlu Dipantau",
      level: "warning",
      description: "Data mulai lama. Cek workflow jika tidak segera diperbarui.",
    };
  }

  return {
    label: "Terlambat",
    level: "danger",
    description: "Data sudah terlalu lama. Workflow mungkin gagal atau tertunda.",
  };
}

export function normalizeOverallLevel(level) {
  if (["good", "moderate", "warning", "danger", "critical"].includes(level)) {
    return level;
  }

  return "neutral";
}

export function getModeLabel(mode) {
  const labels = {
    manual: "Manual Check",
    morning: "Morning Report",
    "rush-hour": "Rush Hour Report",
    "emergency-watch": "Emergency Watcher",
  };

  return labels[mode] ?? "Unknown Mode";
}

export function getAqiLevel(aqi) {
  const value = safeNumber(aqi);

  if (value <= 50) return "good";
  if (value <= 100) return "moderate";
  if (value <= 150) return "warning";
  if (value <= 200) return "danger";
  return "critical";
}

export function getUvLevel(uv) {
  const value = safeNumber(uv);

  if (value < 3) return "good";
  if (value < 6) return "moderate";
  if (value < 8) return "warning";
  if (value < 11) return "danger";
  return "critical";
}

export function getRainLevel(probability) {
  const value = safeNumber(probability);

  if (value < 40) return "good";
  if (value < 70) return "moderate";
  if (value < 85) return "warning";
  return "danger";
}

export function getBmkgLevel(data) {
  return data?.bmkgWarning?.isActive ? "danger" : "good";
}

export function getSystemLevel(data, freshness) {
  return freshness.level;
}

export function getPrimaryAction(data) {
  const aqi = safeNumber(data?.airQuality?.usAqi);
  const uvMax = safeNumber(data?.uv?.maxToday);
  const rainProbability = safeNumber(data?.forecast?.maxPrecipitationProbability);

  if (data?.emergency?.shouldSend) {
    return data?.advice?.general ?? "Waspadai kondisi lingkungan dan kurangi aktivitas luar ruangan.";
  }

  if (data?.bmkgWarning?.isActive) {
    return "Pantau peringatan BMKG dan kurangi aktivitas luar ruangan jika cuaca memburuk.";
  }

  if (aqi >= 151) {
    return "Kurangi aktivitas luar ruangan dan pertimbangkan memakai masker.";
  }

  if (uvMax >= 8) {
    return "Gunakan sunscreen, topi, dan hindari paparan matahari langsung pada siang hari.";
  }

  if (rainProbability >= 70) {
    return "Siapkan payung atau jas hujan karena peluang hujan cukup tinggi.";
  }

  return data?.advice?.general ?? "Kondisi umum masih dapat dipantau secara normal.";
}
