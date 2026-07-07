import type { BmkgWarning } from "../../domain/entities/BmkgWarning.js";
import type { BmkgRssItem } from "../../infrastructure/api/BmkgWarningClient.js";
import type { LocationContext } from "../../infrastructure/storage/LocationContextRepository.js";

function normalizeText(value: string | undefined | null): string {
  return (value ?? "").toLowerCase();
}

function findMatchedSuburbs(text: string, context: LocationContext): string[] {
  const matched = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const suburb of context.nearbySuburbs) {
    const lowerSuburb = suburb.toLowerCase();
    
    // Use regex with word boundaries to prevent partial matches (e.g., "depok" matching "depoksari")
    // Also handle possible punctuation around the suburb name in BMKG alerts
    const regex = new RegExp(`\\b${lowerSuburb}\\b`, "i");
    
    if (regex.test(lowerText)) {
      matched.add(suburb);
    }
  }

  return [...matched];
}

export function mapBmkgWarning(
  items: BmkgRssItem[],
  context: LocationContext
): BmkgWarning {
  for (const item of items) {
    const combinedText = [
      item.title,
      item.description,
      item.author,
    ]
      .map(normalizeText)
      .join(" ");

    const matchedKeywords = findMatchedSuburbs(combinedText, context);

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