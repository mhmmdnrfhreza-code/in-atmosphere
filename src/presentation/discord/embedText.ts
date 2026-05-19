const DISCORD_FIELD_LIMIT = 1024;

export function fallbackText(value: string | null | undefined): string {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : "-";
}

export function bullet(label: string, value: string | number): string {
  return `• ${label}: **${value}**`;
}

export function plainBullet(value: string): string {
  return `• ${value}`;
}

export function joinLines(lines: Array<string | false | null | undefined>): string {
  return lines.filter(Boolean).join("\n");
}

export function truncateDiscordField(value: string, limit = DISCORD_FIELD_LIMIT): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1).trimEnd()}…`;
}

export function formatListOrFallback(items: string[], fallback: string): string {
  if (items.length === 0) {
    return fallback;
  }

  return items.map(plainBullet).join("\n");
}
