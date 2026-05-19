import { $, renderPills, setText } from "./js/dom.js";
import { formatDataAge, formatDateTime, formatNumber, formatTime } from "./js/formatters.js";
import {
  getAqiLevel,
  getBmkgLevel,
  getFreshness,
  getModeLabel,
  getPrimaryAction,
  getRainLevel,
  getSystemLevel,
  getUvLevel,
  normalizeOverallLevel,
} from "./js/status.js";
import {
  getAirQualityNarrative,
  getUvNarrative,
  getWeatherNarrative,
} from "./js/narratives.js";

const DATA_URL = "./data/latest.json";
const THEME_STORAGE_KEY = "in-atmosphere-theme";
const THEME_COLORS = {
  dark: "#0b1120",
  light: "#f3f6fb",
};

const STATUS_CLASSES = [
  "is-neutral",
  "is-good",
  "is-moderate",
  "is-info",
  "is-warning",
  "is-danger",
  "is-critical",
];

const HERO_CLASSES = [
  "is-good",
  "is-moderate",
  "is-warning",
  "is-danger",
  "is-critical",
];

function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "dark";
  } catch {
    return "dark";
  }
}

function persistTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Local storage can be unavailable in restricted browsers; theme still works.
  }
}

function applyTheme(theme) {
  const safeTheme = theme === "light" ? "light" : "dark";
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const toggle = $("theme-toggle");
  const toggleLabel = $("theme-toggle-label");
  const toggleIcon = document.querySelector(".theme-toggle__icon");

  document.documentElement.dataset.theme = safeTheme;

  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", THEME_COLORS[safeTheme]);
  }

  if (toggle) {
    toggle.setAttribute("aria-pressed", String(safeTheme === "dark"));
    toggle.setAttribute(
      "aria-label",
      safeTheme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"
    );
  }

  if (toggleLabel) {
    toggleLabel.textContent = safeTheme === "dark" ? "Dark" : "Light";
  }

  if (toggleIcon) {
    toggleIcon.textContent = safeTheme === "dark" ? "☾" : "☀";
  }
}

function setupThemeToggle() {
  const toggle = $("theme-toggle");

  applyTheme(getStoredTheme());

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";

    applyTheme(nextTheme);
    persistTheme(nextTheme);
  });
}

function setStatusClass(id, level) {
  const element = $(id);
  if (!element) return;

  element.classList.remove(...STATUS_CLASSES);
  element.classList.add(`is-${level || "neutral"}`);
}

function setIndicatorClass(id, level) {
  const element = $(id);
  if (!element) return;

  element.classList.remove("is-good", "is-warning", "is-danger", "is-critical");

  if (level === "good") element.classList.add("is-good");
  if (level === "warning" || level === "moderate") element.classList.add("is-warning");
  if (level === "danger") element.classList.add("is-danger");
  if (level === "critical") element.classList.add("is-critical");
}

function setHeroClass(level) {
  const element = $("hero-status-card");
  if (!element) return;

  element.classList.remove(...HERO_CLASSES);

  if (level) {
    element.classList.add(`is-${level}`);
  }
}

function setRiskChip(id, label, value, level) {
  const element = $(id);
  if (!element) return;

  element.textContent = `${label}: ${value}`;
  element.dataset.level = level;
}

function renderSources(id, sources) {
  renderPills(id, sources, "source-pill", "Open-Meteo, BMKG");
}

function renderKeywords(id, keywords) {
  renderPills(id, keywords, "keyword-pill", "Tidak ada keyword aktif");
}

function formatRainWindow(data) {
  const nextRainTime = data?.forecast?.nextRainTime;
  const nextRainProbability = data?.forecast?.nextRainProbability;
  const peakRainTime = data?.forecast?.peakRainTime;

  if (!nextRainTime) {
    return "Belum ada estimasi hujan signifikan";
  }

  const nextText = `${formatTime(nextRainTime)} (${formatNumber(nextRainProbability, 0)}%)`;
  const peakText = peakRainTime ? `, puncak sekitar ${formatTime(peakRainTime)}` : "";

  return `${nextText}${peakText}`;
}

function renderReasonList(reasons) {
  const container = $("emergency-reasons");
  if (!container) return;

  container.innerHTML = "";

  const safeReasons =
    Array.isArray(reasons) && reasons.length > 0
      ? reasons
      : ["Tidak ada alasan darurat yang terdeteksi."];

  safeReasons.forEach((reason) => {
    const item = document.createElement("li");
    item.textContent = reason;
    container.appendChild(item);
  });
}

function renderTopbar(data, freshness) {
  setText("city-label", data?.city ?? "Kota Bogor");
}

function renderOverview(data, freshness) {
  const level = normalizeOverallLevel(data?.overallStatus?.level);

  setHeroClass(level);

  setText("overall-label", data?.overallStatus?.label ?? "Data tidak tersedia");
  setText(
    "overall-description",
    data?.overallStatus?.description ?? "Dashboard belum menerima data terbaru."
  );
  setText("primary-action", getPrimaryAction(data));

  setText("overall-level-badge", level.toUpperCase());
  setStatusClass("overall-level-badge", level);

  const aqiText = `${data?.airQuality?.usAqi ?? "-"} ${data?.airQuality?.aqiLabel ?? ""}`.trim();
  const uvText = `${formatNumber(data?.uv?.maxToday)} ${data?.uv?.label ?? ""}`.trim();
  const rainText = `${formatNumber(data?.forecast?.maxPrecipitationProbability, 0)}%`;
  const bmkgText = data?.bmkgWarning?.isActive ? "Aktif" : "Aman";

  setRiskChip("aqi-risk-chip", "AQI", aqiText, getAqiLevel(data?.airQuality?.usAqi));
  setRiskChip("uv-risk-chip", "UV", uvText, getUvLevel(data?.uv?.maxToday));
  setRiskChip("rain-risk-chip", "Hujan", rainText, getRainLevel(data?.forecast?.maxPrecipitationProbability));
  setRiskChip("bmkg-risk-chip", "BMKG", bmkgText, getBmkgLevel(data));

  const systemLevel = getSystemLevel(data, freshness);
  const systemStatusLabel =
    systemLevel === "good"
      ? "Online"
      : systemLevel === "warning"
        ? "Needs Attention"
        : systemLevel === "danger"
          ? "Warning"
          : "Critical";

  setText("system-status-label", systemStatusLabel);
  setText("system-status-description", freshness.description);
  setIndicatorClass("system-status-indicator", systemLevel);

  setText("generated-at-value", formatDateTime(data?.generatedAt));
  setText("report-mode-value", getModeLabel(data?.reportMode));
  setText("data-age-value", formatDataAge(data?.generatedAt));

}

function renderPrimaryMetricsCompact(data) {
  setText("temperature-value", formatNumber(data?.weather?.temperature));
  setText(
    "temperature-description",
    `Min-max ${formatNumber(data?.forecast?.minTemperature)}-${formatNumber(data?.forecast?.maxTemperature)}°C.`
  );

  setText("aqi-value", data?.airQuality?.usAqi ?? "-");
  setText("aqi-label", data?.airQuality?.aqiLabel ?? "AQI");
  setText("aqi-description", `PM2.5 ${formatNumber(data?.airQuality?.pm25)} µg/m³.`);

  setText("uv-value", formatNumber(data?.uv?.current));
  setText("uv-label", data?.uv?.label ?? "UV");
  setText("uv-description", `Maksimum ${formatNumber(data?.uv?.maxToday)}.`);

  setText(
    "rain-probability-value",
    formatNumber(data?.forecast?.maxPrecipitationProbability, 0)
  );
  setText("rain-description", formatRainWindow(data));

  setText("humidity-value", formatNumber(data?.weather?.humidity, 0));
  setText("wind-gust-value", formatNumber(data?.weather?.windGust));
}

function renderRiskAndAdvice(data) {
  const emergencyActive = Boolean(data?.emergency?.shouldSend);

  setText("emergency-title", data?.emergency?.title ?? "Tidak ada emergency alert");
  setText("emergency-status-badge", emergencyActive ? "Active" : "Normal");
  setStatusClass("emergency-status-badge", emergencyActive ? "danger" : "good");

  renderReasonList(data?.emergency?.reasons);

  setText("advice-general", data?.advice?.general ?? "-");
  setText("advice-outdoor", data?.advice?.outdoor ?? "-");
  setText("advice-sensitive", data?.advice?.sensitiveGroup ?? "-");
}

function renderDetailsWithNarratives(data) {
  setText("weather-temperature", `${formatNumber(data?.weather?.temperature)}°C`);
  setText(
    "weather-temp-range",
    `${formatNumber(data?.forecast?.minTemperature)}-${formatNumber(data?.forecast?.maxTemperature)}°C`
  );
  setText("weather-humidity", `${formatNumber(data?.weather?.humidity, 0)}%`);
  setText("weather-rain", `${formatNumber(data?.weather?.rain)} mm`);
  setText("weather-rain-window", formatRainWindow(data));
  setText("weather-wind-speed", `${formatNumber(data?.weather?.windSpeed)} km/jam`);
  setText("weather-narrative", getWeatherNarrative(data));

  setText("air-aqi", `${data?.airQuality?.aqiEmoji ?? ""} ${data?.airQuality?.usAqi ?? "-"}`);
  setText("air-aqi-category", data?.airQuality?.aqiLabel ?? "-");
  setText("air-pm25", `${formatNumber(data?.airQuality?.pm25)} µg/m³`);
  setText("air-pm10", `${formatNumber(data?.airQuality?.pm10)} µg/m³`);
  setText("air-ozone", `${formatNumber(data?.airQuality?.ozone)} µg/m³`);
  setText("air-quality-narrative", getAirQualityNarrative(data));

  setText("uv-current-detail", `${data?.uv?.emoji ?? ""} ${formatNumber(data?.uv?.current)}`);
  setText("uv-max-detail", formatNumber(data?.uv?.maxToday));
  setText("uv-category-detail", data?.uv?.label ?? "-");
  setText("uv-advice-detail", getUvNarrative(data));
}

function renderBmkg(data) {
  const warning = data?.bmkgWarning;
  const isActive = Boolean(warning?.isActive);

  setText("bmkg-status-badge", isActive ? "Active" : "Clear");
  setStatusClass("bmkg-status-badge", isActive ? "danger" : "good");

  if (isActive) {
    setText("bmkg-warning-title", warning?.title ?? "Peringatan Dini BMKG");
    setText(
      "bmkg-warning-description",
      warning?.description ?? "Ada peringatan dini cuaca dari BMKG."
    );
  } else {
    setText("bmkg-warning-title", "Tidak ada peringatan dini BMKG yang relevan.");
    setText(
      "bmkg-warning-description",
      "Status wilayah Bogor masih dalam pemantauan normal berdasarkan filter sistem."
    );
  }

  renderKeywords("bmkg-keywords", warning?.matchedKeywords);
}

function renderSystem(data, freshness) {
  const systemLevel = getSystemLevel(data, freshness);

  setText(
    "automation-status",
    systemLevel === "good"
      ? "Active"
      : systemLevel === "warning"
        ? "Needs Attention"
        : "Check Required"
  );
  setText("automation-mode", getModeLabel(data?.reportMode));
  setText("automation-freshness", freshness.label);

  renderSources("sources", data?.sources);
  setText("footer-year", new Date().getFullYear().toString());
}

function renderDashboard(data) {
  const freshness = getFreshness(data?.generatedAt);

  renderTopbar(data, freshness);
  renderOverview(data, freshness);
  renderPrimaryMetricsCompact(data);
  renderRiskAndAdvice(data);
  renderDetailsWithNarratives(data);
  renderBmkg(data);
  renderSystem(data, freshness);

  console.log("In Atmosphere dashboard rendered:", data);
}

function renderLoadingState() {
  setText("overall-label", "Memuat...");
  setText("overall-description", "Mengambil data terbaru dari In Atmosphere.");
  setText("system-status-label", "Checking...");
  setText("system-status-description", "Dashboard sedang membaca latest.json.");
}

function renderErrorState(error) {
  console.error("In Atmosphere dashboard error:", error);

  setHeroClass("danger");

  setText("overall-label", "Gagal Memuat Data");
  setText(
    "overall-description",
    "Dashboard tidak bisa membaca public/data/latest.json. Cek path file, hasil deploy GitHub Pages, atau console browser."
  );
  setText("primary-action", "Cek public/data/latest.json dan pastikan app.js berada langsung di folder public/.");

  setText("overall-level-badge", "ERROR");
  setStatusClass("overall-level-badge", "danger");

  setText("system-status-label", "Error");
  setText("system-status-description", "Data dashboard gagal dimuat.");
  setIndicatorClass("system-status-indicator", "danger");

  renderReasonList([
    "File latest.json tidak terbaca.",
    "Pastikan public/app.js, public/index.html, dan public/data/latest.json berada pada struktur folder yang benar.",
  ]);
}

async function loadDashboardData() {
  renderLoadingState();

  const response = await fetch(`${DATA_URL}?t=${Date.now()}`, {
    cache: "no-store",
  });

  console.log("latest.json response status:", response.status);

  if (!response.ok) {
    throw new Error(`Failed to fetch latest.json. Status: ${response.status}`);
  }

  return response.json();
}

function setupActiveNavigation() {
  const navLinks = Array.from(document.querySelectorAll(".sidebar__nav .nav-link"));
  const sections = navLinks
    .map((link) => {
      const targetId = link.getAttribute("href")?.replace("#", "");
      return targetId ? $(targetId) : null;
    })
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || sections.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      const activeId = visibleEntry.target.id;

      navLinks.forEach((link) => {
        const target = link.getAttribute("href");
        link.classList.toggle("is-active", target === `#${activeId}`);
      });
    },
    {
      root: null,
      threshold: [0.18, 0.32, 0.5],
      rootMargin: "-18% 0px -60% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
}

async function initDashboard() {
  setupThemeToggle();

  try {
    setupActiveNavigation();

    const data = await loadDashboardData();
    renderDashboard(data);
  } catch (error) {
    renderErrorState(error);
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);
