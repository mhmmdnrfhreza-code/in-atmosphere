import "dotenv/config";

export const env = {
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  dashboardUrl: process.env.DASHBOARD_URL,
  bogorLat: Number(process.env.BOGOR_LAT ?? -6.5963564),
  bogorLon: Number(process.env.BOGOR_LON ?? 106.7973188),
};

export function validateEnv(): void {
  if (!env.discordWebhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL belum diatur di file .env");
  }

  if (Number.isNaN(env.bogorLat) || Number.isNaN(env.bogorLon)) {
    throw new Error("BOGOR_LAT atau BOGOR_LON tidak valid");
  }
}
