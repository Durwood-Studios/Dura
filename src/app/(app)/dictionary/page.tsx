import type { Metadata } from "next";
import { DictionaryClient } from "@/components/dictionary/DictionaryClient";
import { searchTerms, getCategories } from "@/lib/dictionary";
import { DICTIONARY } from "@/content/dictionary";

export const metadata: Metadata = {
  title: "Dictionary — DURA",
  description: "Verified engineering terms with three-tier definitions.",
};

export default function DictionaryPage(): React.ReactElement {
  const initialTerms = searchTerms({ limit: 50 });
  const categories = getCategories();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-1 text-3xl font-semibold">Dictionary</h1>
      <p className="mb-6 text-[var(--color-text-secondary)]">
        {DICTIONARY.length} verified terms. Three tiers each: beginner, intermediate, advanced.
      </p>
      <DictionaryClient
        initialTerms={initialTerms}
        categories={categories}
        totalCount={DICTIONARY.length}
      />
    </main>
  );
}
