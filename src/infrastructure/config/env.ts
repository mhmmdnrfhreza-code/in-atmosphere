import "dotenv/config";

export const env = {
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  dashboardUrl: process.env.DASHBOARD_URL,
};

export function validateEnv(): void {
  if (!env.discordWebhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL belum diatur di file .env");
  }
}
