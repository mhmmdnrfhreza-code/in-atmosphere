import type { BmkgWarning } from "../../domain/entities/BmkgWarning.js";
import type { BmkgRssItem } from "../../infrastructure/api/BmkgWarningClient.js";

const BOGOR_KEYWORDS = [
  "bogor",
  "kota bogor",
  "kabupaten bogor",
  "jabodetabek",
  "jawa barat",
];

function normalizeText(value: string | undefined | null): string {
  return (value ?? "").toLowerCase();
}

function findMatchedKeywords(text: string): string[] {
  return BOGOR_KEYWORDS.filter((keyword) => text.includes(keyword));
}

export function mapBmkgWarning(items: BmkgRssItem[]): BmkgWarning {
  for (const item of items) {
    const combinedText = [
      item.title,
      item.description,
      item.author,
    ]
      .map(normalizeText)
      .join(" ");

    const matchedKeywords = findMatchedKeywords(combinedText);

    if (matchedKeywords.length > 0) {
      return {
        isActive: true,
        title: item.title ?? "Peringatan Dini Cuaca BMKG",
        description: item.description ?? "Ada peringatan dini cuaca dari BMKG.",
        publishedAt: item.pubDate ?? null,
        source: "BMKG",
        matchedKeywords,
      };
    }
  }

  return {
    isActive: false,
    title: null,
    description: null,
    publishedAt: null,
    source: "BMKG",
    matchedKeywords: [],
  };
}