import axios from "axios";
import { env } from "../config/env.js";

interface DiscordAllowedMentions {
  parse: string[];
}

interface DiscordPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: unknown[];
  allowed_mentions?: DiscordAllowedMentions;
}

export interface DiscordWebhookMessage {
  id: string;
}

export interface DiscordWebhookMessageClient {
  sendPayload(payload: DiscordPayload): Promise<void>;
  sendPayloadAndReturnMessage(
    payload: DiscordPayload
  ): Promise<DiscordWebhookMessage>;
  editMessage(messageId: string, payload: DiscordPayload): Promise<void>;
  deleteMessage(messageId: string): Promise<boolean>;
}

export class DiscordWebhookMessageNotFoundError extends Error {
  constructor(message = "Discord webhook message not found") {
    super(message);
    this.name = "DiscordWebhookMessageNotFoundError";
  }
}

function getWebhookUrl(): string {
  if (!env.discordWebhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL belum diatur");
  }

  return env.discordWebhookUrl;
}

function withAllowedMentions(payload: DiscordPayload): DiscordPayload {
  return {
    ...payload,
    allowed_mentions: {
      parse: [],
    },
  };
}

function isAxiosNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

function buildWebhookMessageUrl(messageId: string): string {
  const url = new URL(getWebhookUrl());
  url.pathname = `${url.pathname.replace(/\/$/, "")}/messages/${encodeURIComponent(messageId)}`;
  url.search = "";

  return url.toString();
}

function buildWebhookWaitUrl(): string {
  const url = new URL(getWebhookUrl());
  url.searchParams.set("wait", "true");

  return url.toString();
}

export async function sendDiscordPayload(payload: DiscordPayload): Promise<void> {
  await axios.post(getWebhookUrl(), withAllowedMentions(payload));
}

export async function sendDiscordPayloadAndReturnMessage(
  payload: DiscordPayload
): Promise<DiscordWebhookMessage> {
  const response = await axios.post(
    buildWebhookWaitUrl(),
    withAllowedMentions(payload)
  );

  const messageId = response.data?.id;

  if (typeof messageId !== "string" || messageId.length === 0) {
    throw new Error("Discord tidak mengembalikan message ID");
  }

  return { id: messageId };
}

export async function editDiscordWebhookMessage(
  messageId: string,
  payload: DiscordPayload
): Promise<void> {
  try {
    await axios.patch(buildWebhookMessageUrl(messageId), withAllowedMentions(payload));
  } catch (error) {
    if (isAxiosNotFound(error)) {
      throw new DiscordWebhookMessageNotFoundError();
    }

    throw error;
  }
}

export async function deleteDiscordWebhookMessage(
  messageId: string
): Promise<boolean> {
  try {
    await axios.delete(buildWebhookMessageUrl(messageId));
    return true;
  } catch (error) {
    if (isAxiosNotFound(error)) {
      return false;
    }

    throw error;
  }
}

export async function sendDiscordMessage(content: string): Promise<void> {
  await sendDiscordPayload({
    username: "In Atmosphere",
    avatar_url: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
    content,
  });
}

export const discordWebhookMessageClient: DiscordWebhookMessageClient = {
  sendPayload: sendDiscordPayload,
  sendPayloadAndReturnMessage: sendDiscordPayloadAndReturnMessage,
  editMessage: editDiscordWebhookMessage,
  deleteMessage: deleteDiscordWebhookMessage,
};
