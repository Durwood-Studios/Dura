import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { Certificate } from "@/types/assessment";

export async function putCertificate(cert: Certificate): Promise<void> {
  try {
    const db = await getDB();
    await db.put("certificates", cert);
    triggerShadowWrite();
  } catch (error) {
    console.error("[certificates] putCertificate failed", error);
  }
}

export async function getCertificateByHash(hash: string): Promise<Certificate | null> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex("certificates", "by-hash", hash);
    return all[0] ?? null;
  } catch (error) {
    console.error("[certificates] getCertificateByHash failed", error);
    return null;
  }
}

export async function getCertificatesByPhase(phaseId: string): Promise<Certificate[]> {
  try {
    const db = await getDB();
    return await db.getAllFromIndex("certificates", "by-phase", phaseId);
  } catch (error) {
    console.error("[certificates] getCertificatesByPhase failed", error);
    return [];
  }
}

export async function getAllCertificates(): Promise<Certificate[]> {
  try {
    const db = await getDB();
    return await db.getAll("certificates");
  } catch (error) {
    console.error("[certificates] getAllCertificates failed", error);
    return [];
  }
}
