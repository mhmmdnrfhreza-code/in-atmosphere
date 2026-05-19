export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  icon_url?: string;
  url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: DiscordEmbedFooter;
  author?: DiscordEmbedAuthor;
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
  allowed_mentions?: {
    parse: string[];
  };
}
