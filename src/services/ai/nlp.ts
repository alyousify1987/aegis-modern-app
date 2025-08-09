// Lightweight NLP service with optional nlp.js dynamic import and regex fallback
export type Entity = { type: string; value: string; start: number; end: number };

export async function initNLP(): Promise<void> { /* no-op heuristic mode */ }

export async function extractEntities(text: string): Promise<Entity[]> {
  await initNLP();
  // Fallback: detect ISO references and dates
  const out: Entity[] = [];
  const isoRegex = /(ISO\s?(9001|27001|22000))/gi;
  const dateRegex = /(\d{4}-\d{2}-\d{2})/g;
  for (const m of text.matchAll(isoRegex)) {
    out.push({ type: 'standard', value: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
  }
  for (const m of text.matchAll(dateRegex)) {
    out.push({ type: 'date', value: m[0], start: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
  }
  return out;
}
