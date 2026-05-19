const ONE_MINUTE_IN_MS = 60 * 1000;

export function hasCooldownPassed(
  lastSentAt: string | null,
  cooldownMinutes: number,
  now: Date = new Date()
): boolean {
  if (!lastSentAt) return true;

  const lastTime = new Date(lastSentAt).getTime();

  if (Number.isNaN(lastTime)) return true;

  const diffInMs = now.getTime() - lastTime;
  const cooldownInMs = cooldownMinutes * ONE_MINUTE_IN_MS;

  return diffInMs >= cooldownInMs;
}