import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { CourtSetup } from "../types";

export const COURT_SETUPS_COLLECTION = "court_setups";
export const MAX_COURTS_PER_SETUP = 8;

export function normalizeCourtSetupDraft(s: { label: string; courts: string[] }): { label: string; courts: string[] } | null {
  const label = s.label.trim();
  const courts = s.courts
    .map((c) => (typeof c === "string" ? c.trim() : ""))
    .filter(Boolean)
    .slice(0, MAX_COURTS_PER_SETUP);
  if (!label || courts.length === 0) return null;
  return { label, courts };
}

export async function loadCourtSetups(db: Firestore): Promise<CourtSetup[]> {
  const snap = await getDocs(collection(db, COURT_SETUPS_COLLECTION));
  return snap.docs
    .map((d) => {
      const data = d.data();
      const label = typeof data.label === "string" ? data.label.trim() : "";
      const raw = Array.isArray(data.courts) ? data.courts : [];
      const courts = raw
        .map((c: unknown) => (typeof c === "string" ? c.trim() : ""))
        .filter(Boolean)
        .slice(0, MAX_COURTS_PER_SETUP);
      return { id: d.id, label, courts };
    })
    .filter((s) => s.label.length > 0 && s.courts.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Writes setups in list order; returned IDs match that order (for remapping UI selection after save). */
export async function replaceAllCourtSetups(db: Firestore, drafts: { label: string; courts: string[] }[]): Promise<CourtSetup[]> {
  const cleaned = drafts.map(normalizeCourtSetupDraft).filter(Boolean) as { label: string; courts: string[] }[];
  const batch = writeBatch(db);
  const existing = await getDocs(collection(db, COURT_SETUPS_COLLECTION));
  existing.forEach((d) => batch.delete(d.ref));
  const results: CourtSetup[] = [];
  cleaned.forEach((s) => {
    const ref = doc(collection(db, COURT_SETUPS_COLLECTION));
    batch.set(ref, { label: s.label, courts: s.courts });
    results.push({ id: ref.id, label: s.label, courts: [...s.courts] });
  });
  await batch.commit();
  return results;
}
