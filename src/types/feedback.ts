export type FeedbackCategory = "bug" | "feature" | "content" | "general";

export interface FeedbackEntry {
  id: string;
  message: string;
  category: FeedbackCategory;
  pageUrl: string;
  createdAt: number;
  synced: boolean;
}
