// Enhanced NLP service with regex fallback (browser-compatible)
// TODO: Integrate with browser-compatible NLP library in Phase 2

export type Entity = { type: string; value: string; start: number; end: number };

let isInitialized = false;

export async function initNLP(): Promise<void> {
  if (isInitialized) return;
  
  try {
    console.log('NLP Service: Using browser-compatible regex implementation');
    isInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize NLP service:', error);
    isInitialized = true;
  }
}

export async function extractEntities(text: string): Promise<Entity[]> {
  await initNLP();
  const entities: Entity[] = [];
  
  // Use regex-based entity extraction as fallback
  entities.push(...extractRegexEntities(text));
  
  return entities;
}

function extractRegexEntities(text: string): Entity[] {
  const entities: Entity[] = [];
  
  // Fallback regex patterns for critical audit terms
  const patterns = [
    { type: 'standard', regex: /(ISO\s?(9001|27001|22000|14001|45001))/gi },
    { type: 'date', regex: /(\d{4}-\d{2}-\d{2})/g },
    { type: 'clause', regex: /(\d+\.\d+(?:\.\d+)?)/g },
    { type: 'finding_severity', regex: /(major|minor|critical|high|medium|low)\s?(nonconformity|NC|finding)/gi },
    { type: 'audit_type', regex: /(internal|external|supplier|regulatory|certification)\s?audit/gi },
    { type: 'capa', regex: /(corrective|preventive)\s?action/gi }
  ];
  
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern.regex)) {
      if (match.index !== undefined) {
        entities.push({
          type: pattern.type,
          value: match[0],
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }
  }
  
  return entities;
}

export type AuditClassification = {
  category: string;
  confidence: number;
  subcategory: string;
};

export async function classifyContent(text: string): Promise<AuditClassification> {
  await initNLP();
  
  // Use fallback classification logic
  const auditKeywords = {
    'internal': /(internal|staff|employee)/gi,
    'external': /(external|third.party|vendor|supplier)/gi,
    'regulatory': /(regulatory|compliance|legal|government)/gi,
    'certification': /(certification|accreditation|iso)/gi
  };
  
  for (const [category, regex] of Object.entries(auditKeywords)) {
    if (regex.test(text)) {
      return {
        category: 'audit',
        confidence: 0.8,
        subcategory: category
      };
    }
  }
  
  return {
    category: 'general',
    confidence: 0.3,
    subcategory: 'other'
  };
}

export async function classifyText(text: string): Promise<{ intent: string; confidence: number }> {
  await initNLP();
  
  // Simple rule-based classification fallback
  const auditKeywords = ['audit', 'compliance', 'standard', 'nonconformity'];
  const riskKeywords = ['risk', 'hazard', 'threat', 'vulnerability'];
  const actionKeywords = ['action', 'capa', 'corrective', 'preventive'];
  
  const lowerText = text.toLowerCase();
  
  if (auditKeywords.some(keyword => lowerText.includes(keyword))) {
    return { intent: 'audit_related', confidence: 0.7 };
  } else if (riskKeywords.some(keyword => lowerText.includes(keyword))) {
    return { intent: 'risk_related', confidence: 0.7 };
  } else if (actionKeywords.some(keyword => lowerText.includes(keyword))) {
    return { intent: 'action_related', confidence: 0.7 };
  }
  
  return { intent: 'general', confidence: 0.5 };
}
