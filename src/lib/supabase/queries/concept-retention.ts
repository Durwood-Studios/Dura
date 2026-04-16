import { createClient } from "@/lib/supabase/client";
import { guardedQuery } from "@/lib/supabase/guard";

interface ConceptRetention {
  conceptId: string;
  lastPracticed: number;
  /** Retention strength from 0 to 1, decays over time */
  strength: number;
}

/**
 * Track concept retention — fetches all concept practice records for a user.
 * Strength decays exponentially based on time since last practice.
 * Returns empty array when Supabase is unavailable.
 */
export async function getConceptRetention(userId: string): Promise<ConceptRetention[]> {
  return guardedQuery<ConceptRetention[]>(
    "database",
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("concept_retention")
        .select("concept_id, last_practiced, strength")
        .eq("user_id", userId);

      if (error) return { data: null, error };

      const mapped = (data ?? []).map(
        (row): ConceptRetention => ({
          conceptId: row.concept_id as string,
          lastPracticed: new Date(row.last_practiced as string).getTime(),
          strength: Number(row.strength),
        })
      );

      return { data: mapped, error: null };
    },
    []
  );
}

/**
 * Get concept IDs due for review (strength below threshold).
 * Default threshold is 0.5 — concepts weaker than this need practice.
 * Returns empty array when Supabase is unavailable.
 */
export async function getDueConceptReviews(
  userId: string,
  threshold: number = 0.5
): Promise<string[]> {
  return guardedQuery<string[]>(
    "database",
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("concept_retention")
        .select("concept_id")
        .eq("user_id", userId)
        .lt("strength", threshold)
        .order("strength", { ascending: true });

      if (error) return { data: null, error };

      const ids = (data ?? []).map((row) => row.concept_id as string);
      return { data: ids, error: null };
    },
    []
  );
}
