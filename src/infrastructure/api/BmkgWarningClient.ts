import axios from "axios";
import { XMLParser } from "fast-xml-parser";

export interface BmkgRssItem {
  title?: string;
  link?: string;
  description?: string;
  author?: string;
  pubDate?: string;
}

interface BmkgRssResponse {
  rss?: {
    channel?: {
      item?: BmkgRssItem | BmkgRssItem[];
    };
  };
}

const BMKG_NOWCAST_RSS_URL = "https://www.bmkg.go.id/alerts/nowcast/id";

function normalizeItems(item: BmkgRssItem | BmkgRssItem[] | undefined): BmkgRssItem[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

export async function fetchBmkgNowcastWarnings(): Promise<BmkgRssItem[]> {
  const response = await axios.get<string>(BMKG_NOWCAST_RSS_URL, {
    responseType: "text",
    timeout: 15000,
  });

  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });

  const parsed = parser.parse(response.data) as BmkgRssResponse;

  return normalizeItems(parsed.rss?.channel?.item);
}