import { getDb, ensureDb } from '../db';
import { getDecrypted, putEncrypted } from '../db/secure';

type AnalyticsSummary = {
  totalAudits: number;
  completedAudits: number;
  inProgressAudits: number;
  plannedAudits: number;
  pendingActions: number;
  criticalFindings: number;
  riskScore: number;
  complianceScore: number;
};

const db = getDb();
async function ensure(){ await ensureDb(); }

export async function saveSummary(summary: AnalyticsSummary) {
  await ensure();
  await putEncrypted('analytics', 'summary', summary);
}

export async function getSummary(): Promise<AnalyticsSummary | undefined> {
  await ensure();
  const dec = await getDecrypted<AnalyticsSummary>('analytics', 'summary');
  if (dec) return dec;
  const val = await db.get<any>('analytics', 'summary');
  if (!val) return undefined;
  const { id, ...rest } = val;
  return rest as AnalyticsSummary;
}
