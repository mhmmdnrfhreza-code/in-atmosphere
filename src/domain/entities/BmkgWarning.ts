export interface BmkgWarning {
  isActive: boolean;
  title: string | null;
  description: string | null;
  publishedAt: string | null;
  source: "BMKG";
  matchedKeywords: string[];
}