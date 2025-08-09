// Rule engine wrapper around json-rules-engine with a tiny API
import { Engine } from 'json-rules-engine';

export type Facts = Record<string, any>;

export async function evaluateRules(rules: any[], facts: Facts): Promise<{ events: any[]; engine: any }>{
  const engine = new Engine();
  for(const r of rules) engine.addRule(r);
  const { events } = await engine.run(facts);
  return { events, engine };
}

// Example rules useful for Diagnostics self-test
export const demoRules: any[] = [
  {
    conditions: {
      any: [
        { fact: 'severity', operator: 'equal', value: 'major' },
        { fact: 'overdue', operator: 'equal', value: true },
      ]
    },
    event: { type: 'ncr-flag', params: { priority: 'high' } }
  }
];
