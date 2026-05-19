import { formatNumber, formatTime, safeNumber } from "./formatters.js";

function getRainTimingSentence(data) {
  if (!data?.forecast?.nextRainTime) {
    return "Belum ada estimasi jam hujan signifikan dari prakiraan per jam.";
  }

  const probability = formatNumber(data?.forecast?.nextRainProbability, 0);
  const peak = data?.forecast?.peakRainTime
    ? ` Puncak peluang hujan diperkirakan sekitar ${formatTime(data.forecast.peakRainTime)}.`
    : "";

  return `Jendela hujan terdekat diperkirakan sekitar ${formatTime(data.forecast.nextRainTime)} dengan peluang ${probability}%.${peak}`;
}

export function getWeatherNarrative(data) {
  const rain = safeNumber(data?.weather?.rain);
  const rainProbability = safeNumber(data?.forecast?.maxPrecipitationProbability);
  const windGust = safeNumber(data?.weather?.windGust);
  const humidity = safeNumber(data?.weather?.humidity);

  if (data?.bmkgWarning?.isActive) {
    return `BMKG sedang memantau potensi cuaca signifikan di wilayah terkait. ${getRainTimingSentence(data)} Jadikan peringatan ini sebagai sinyal untuk menunda aktivitas luar yang tidak mendesak, menghindari area rawan genangan, dan menyiapkan rute pulang alternatif. Jika hujan menguat disertai petir atau angin kencang, segera cari tempat berlindung yang aman dan hindari berteduh di bawah pohon, baliho, atau struktur ringan.`;
  }

  if (rain >= 10 || rainProbability >= 85 || windGust >= 40) {
    return `Kondisi cuaca perlu diantisipasi lebih serius. ${getRainTimingSentence(data)} Kombinasi hujan aktual, peluang hujan tinggi, atau hembusan angin kuat dapat mengganggu jarak pandang, perjalanan, dan aktivitas luar ruangan. Kurangi perjalanan yang tidak penting, amankan barang di luar rumah, dan pantau pembaruan BMKG bila aktivitas berlangsung dekat saluran air, lereng, atau area rawan banjir lokal.`;
  }

  if (rainProbability >= 70) {
    return `Peluang hujan cukup tinggi, meski intensitas aktual dapat berbeda antarwilayah. ${getRainTimingSentence(data)} Siapkan payung atau jas hujan, lindungi perangkat elektronik, dan beri waktu tambahan untuk perjalanan. Untuk kegiatan luar, siapkan opsi pindah ke dalam ruangan jika awan gelap, petir, atau angin mulai meningkat.`;
  }

  if (humidity >= 80) {
    return "Udara relatif lembap. Aktivitas luar masih memungkinkan, tetapi tubuh bisa terasa lebih cepat gerah karena penguapan keringat kurang optimal. Cukupkan minum, beri jeda saat aktivitas fisik, dan perhatikan tanda tidak nyaman seperti pusing, lemas, atau napas terasa berat.";
  }

  return `Cuaca relatif terkendali untuk aktivitas harian. ${getRainTimingSentence(data)} Tetap pantau perubahan mendadak karena hujan lokal di Bogor dapat berubah cepat, terutama pada siang hingga sore hari. Untuk perjalanan jauh atau kegiatan luar yang lama, tetap siapkan perlindungan hujan ringan dan cek pembaruan sebelum berangkat.`;
}

export function getAirQualityNarrative(data) {
  const aqi = safeNumber(data?.airQuality?.usAqi);
  const label = data?.airQuality?.aqiLabel ?? "Tidak tersedia";
  const pm25 = formatNumber(data?.airQuality?.pm25);

  if (aqi <= 50) {
    return `AQI ${aqi} berada pada kategori ${label}. Kualitas udara umumnya baik untuk mayoritas orang, sehingga aktivitas luar ruangan dapat dilakukan seperti biasa. PM2.5 tercatat ${pm25} µg/m³; partikel halus seperti ini tetap relevan dipantau karena dapat masuk jauh ke saluran pernapasan bila konsentrasinya meningkat.`;
  }

  if (aqi <= 100) {
    return `AQI ${aqi} berada pada kategori ${label}. Udara masih dapat diterima bagi mayoritas orang, tetapi individu yang sangat sensitif terhadap polusi sebaiknya memperhatikan gejala seperti batuk, iritasi tenggorokan, mata perih, atau napas terasa berat. Jika gejala muncul, kurangi durasi aktivitas luar dan pilih rute yang lebih jauh dari kepadatan kendaraan.`;
  }

  if (aqi <= 150) {
    return `AQI ${aqi} berada pada kategori ${label}. Kelompok sensitif seperti anak-anak, lansia, ibu hamil, dan penderita gangguan jantung atau pernapasan sebaiknya mengurangi aktivitas berat atau lama di luar ruangan. Masyarakat umum masih dapat beraktivitas, tetapi sebaiknya memperpendek paparan bila kualitas udara terasa mengganggu.`;
  }

  if (aqi <= 200) {
    return `AQI ${aqi} berada pada kategori ${label}. Dampak kesehatan dapat mulai dirasakan lebih luas, terutama dari paparan partikel halus dan polutan udara lain yang menurut WHO berkaitan dengan gangguan pernapasan dan kardiovaskular. Kurangi aktivitas berat di luar, tutup jendela saat polusi terasa pekat, dan gunakan masker yang sesuai bila harus bepergian.`;
  }

  return `AQI ${aqi} berada pada kategori ${label}. Batasi aktivitas luar ruangan yang tidak mendesak dan prioritaskan ruang dalam dengan sirkulasi atau filtrasi udara yang lebih baik. Kelompok sensitif sebaiknya menghindari aktivitas luar, memantau gejala, dan mengikuti anjuran tenaga kesehatan bila memiliki kondisi pernapasan atau jantung.`;
}

export function getUvNarrative(data) {
  const uv = safeNumber(data?.uv?.current);
  const uvMax = safeNumber(data?.uv?.maxToday);
  const label = data?.uv?.label ?? "Tidak tersedia";

  if (uvMax < 3) {
    return `UV maksimum hari ini ${formatNumber(uvMax)} (${label}). Risiko paparan berlebih relatif rendah, sehingga aktivitas luar umumnya aman. Perlindungan dasar tetap berguna untuk kulit sangat sensitif, anak-anak, atau paparan lama, terutama saat berada di area terbuka tanpa naungan.`;
  }

  if (uvMax < 6) {
    return `UV maksimum hari ini ${formatNumber(uvMax)} (${label}). Gunakan perlindungan dasar saat berada di luar lebih lama, terutama menjelang tengah hari. Pilih tempat teduh bila memungkinkan, gunakan sunscreen broad-spectrum, dan pertimbangkan topi atau kacamata hitam untuk mengurangi paparan mata dan kulit.`;
  }

  if (uvMax < 8) {
    return `UV maksimum hari ini ${formatNumber(uvMax)} (${label}). Perlindungan aktif disarankan: sunscreen, topi, kacamata hitam, pakaian yang menutup kulit, dan jeda di tempat teduh. UV saat ini ${formatNumber(uv)}; risiko biasanya meningkat saat matahari tinggi, terutama sekitar tengah hari.`;
  }

  if (uvMax < 11) {
    return `UV maksimum hari ini ${formatNumber(uvMax)} (${label}). Batasi paparan langsung pada jam terik dan gunakan perlindungan kulit serta mata secara konsisten. EPA menyarankan perlindungan ekstra pada level sangat tinggi, termasuk mencari teduh, memakai pakaian pelindung, topi lebar, kacamata UV, dan sunscreen broad-spectrum.`;
  }

  return `UV maksimum hari ini ${formatNumber(uvMax)} (${label}). Hindari paparan langsung bila memungkinkan; jika harus keluar, gunakan perlindungan maksimal dan cari tempat teduh sesering mungkin. Paparan berlebih dapat menyebabkan sunburn dan meningkatkan risiko dampak jangka panjang pada kulit serta mata.`;
}
