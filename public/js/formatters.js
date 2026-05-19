export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isNaN(number) ? fallback : number;
}

export function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return Number(value).toFixed(digits).replace(/\.0$/, "");
}

export function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);

  return `${time} WIB`;
}

export function formatDataAge(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) return "baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  if (diffHours < 24) {
    return remainingMinutes === 0
      ? `${diffHours} jam lalu`
      : `${diffHours} jam ${remainingMinutes} menit lalu`;
  }

  return `${Math.floor(diffHours / 24)} hari lalu`;
}
