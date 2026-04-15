import { createClient } from "@/lib/supabase/client";
import type { Certificate } from "@/types/assessment";

/** Row shape returned by the get_certificate_by_hash RPC function. */
interface CertificateRow {
  id: string;
  phase_id: string;
  user_id: string | null;
  display_name: string;
  phase_title: string;
  score: number;
  total_questions: number;
  completed_at: string;
  verification_hash: string;
  standards: string[];
}

/**
 * Sync certificates to Supabase.
 *
 * Strategy: upsert by (id, user_id). Certificates are immutable once
 * created, so conflicts should not occur in practice — the upsert
 * handles edge cases like a retry after a network failure.
 */
export async function syncCertificates(userId: string, certs: Certificate[]): Promise<void> {
  try {
    const supabase = createClient();
    const rows = certs.map((cert) => ({
      id: cert.id,
      user_id: userId,
      phase_id: cert.phaseId,
      display_name: cert.displayName,
      phase_title: cert.phaseTitle,
      score: cert.score,
      total_questions: cert.totalQuestions,
      completed_at: new Date(cert.completedAt).toISOString(),
      verification_hash: cert.verificationHash,
      standards: cert.standards,
    }));

    const { error } = await supabase.from("certificates").upsert(rows, { onConflict: "id" });

    if (error) {
      console.error("[syncCertificates] Upsert error:", error.message);
      throw error;
    }
  } catch (err) {
    console.error("[syncCertificates] Failed to sync:", err);
    throw err;
  }
}

/**
 * Fetch all certificates for a user from Supabase.
 */
export async function fetchCertificates(userId: string): Promise<Certificate[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("certificates").select("*").eq("user_id", userId);

    if (error) {
      console.error("[fetchCertificates] Query error:", error.message);
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id as string,
      phaseId: row.phase_id as string,
      userId: row.user_id as string | null,
      displayName: row.display_name as string,
      phaseTitle: row.phase_title as string,
      score: Number(row.score),
      totalQuestions: Number(row.total_questions),
      completedAt: new Date(row.completed_at as string).getTime(),
      verificationHash: row.verification_hash as string,
      standards: row.standards as string[],
    }));
  } catch (err) {
    console.error("[fetchCertificates] Failed to fetch:", err);
    throw err;
  }
}

/**
 * Look up a certificate by its verification hash.
 *
 * This is a PUBLIC query — no auth required. Used by /verify/[hash]
 * to display certificate details to anyone with the link.
 * Uses the get_certificate_by_hash DB function for security isolation.
 */
export async function getCertificateByHash(hash: string): Promise<Certificate | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_certificate_by_hash", { hash }).single();

    const row = data as unknown as CertificateRow | null;

    if (error) {
      // PGRST116 = no rows found, which is expected for invalid hashes
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("[getCertificateByHash] RPC error:", error.message);
      throw error;
    }

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      phaseId: row.phase_id,
      userId: row.user_id,
      displayName: row.display_name,
      phaseTitle: row.phase_title,
      score: Number(row.score),
      totalQuestions: Number(row.total_questions),
      completedAt: new Date(row.completed_at).getTime(),
      verificationHash: row.verification_hash,
      standards: row.standards,
    };
  } catch (err) {
    console.error("[getCertificateByHash] Failed to fetch:", err);
    throw err;
  }
}
