// Intelligent Document-Clause Linking System for ISO 22000 Audits
import { ISO22000_CLAUSES, type AuditQuestion } from '../../data/iso22000Clauses';

interface DocumentMetadata {
  id: string;
  name: string;
  content: string;
  type: 'manual' | 'procedure' | 'record' | 'certificate' | 'other';
  uploadDate: Date;
  tags: string[];
  linkedClauses: string[];
  relevanceScore: number;
}

// Keywords for automatic clause linking
const CLAUSE_KEYWORDS = {
  '4.1': ['context', 'external', 'internal', 'issues', 'environment', 'stakeholder', 'strategic'],
  '4.2': ['interested parties', 'requirements', 'customers', 'suppliers', 'regulatory', 'authorities'],
  '4.3': ['scope', 'boundary', 'applicability', 'exclusions', 'products', 'services'],
  '4.4': ['food safety management system', 'fsms', 'processes', 'procedures', 'documented'],
  '5.1': ['leadership', 'commitment', 'top management', 'policy', 'objectives'],
  '5.2': ['food safety policy', 'communication', 'understanding', 'application'],
  '5.3': ['roles', 'responsibilities', 'authorities', 'food safety team leader'],
  '6.1': ['risk', 'opportunities', 'planning', 'actions'],
  '6.2': ['food safety objectives', 'measurable', 'planning'],
  '7.1': ['resources', 'infrastructure', 'work environment', 'external providers'],
  '7.2': ['competence', 'training', 'education', 'experience', 'skills'],
  '7.3': ['awareness', 'food safety policy', 'contribution'],
  '7.4': ['communication', 'internal', 'external', 'information'],
  '7.5': ['documented information', 'records', 'documents', 'control'],
  '8.1': ['operational planning', 'control', 'processes'],
  '8.2': ['prerequisite programs', 'prp', 'infrastructure', 'cleaning', 'pest control'],
  '8.3': ['traceability system', 'identification', 'recall'],
  '8.4': ['hazard analysis', 'biological', 'chemical', 'physical', 'allergens'],
  '8.5': ['haccp plan', 'critical control points', 'ccp', 'monitoring', 'critical limits'],
  '8.6': ['updating', 'preliminary information', 'prerequisite programs'],
  '8.7': ['control of monitoring', 'measuring', 'calibration', 'verification'],
  '8.8': ['verification planning', 'activities', 'methods'],
  '8.9': ['control of nonconformity', 'corrections', 'corrective actions'],
  '9.1': ['monitoring', 'measurement', 'analysis', 'evaluation', 'performance'],
  '9.2': ['internal audit', 'audit programme', 'auditors', 'independence'],
  '9.3': ['management review', 'inputs', 'outputs', 'decisions'],
  '10.1': ['continual improvement', 'effectiveness', 'suitability'],
  '10.2': ['nonconformity', 'corrective action', 'root cause'],
  '10.3': ['continual improvement', 'opportunities', 'results']
};

const HACCP_KEYWORDS = {
  'HACCP Principle 1': ['hazard analysis', 'biological hazards', 'chemical hazards', 'physical hazards', 'allergens'],
  'HACCP Principle 2': ['critical control points', 'ccp', 'decision tree', 'control measures'],
  'HACCP Principle 3': ['critical limits', 'temperature', 'time', 'ph', 'water activity', 'limits'],
  'HACCP Principle 4': ['monitoring system', 'monitoring procedures', 'frequency', 'responsibility'],
  'HACCP Principle 5': ['corrective actions', 'deviation', 'nonconformity', 'correction'],
  'HACCP Principle 6': ['verification', 'validation', 'review', 'effectiveness'],
  'HACCP Principle 7': ['record keeping', 'documentation', 'logs', 'monitoring records']
};

const PRP_KEYWORDS = {
  'PRP - Infrastructure': ['building', 'layout', 'design', 'construction', 'facilities'],
  'PRP - Equipment': ['equipment', 'utensils', 'machinery', 'maintenance', 'calibration'],
  'PRP - Cleaning': ['cleaning', 'sanitizing', 'disinfection', 'hygiene', 'chemicals'],
  'PRP - Pest Control': ['pest control', 'rodents', 'insects', 'birds', 'exclusion'],
  'PRP - Personal Hygiene': ['personal hygiene', 'hand washing', 'clothing', 'health', 'training'],
  'PRP - Supplier Control': ['supplier', 'incoming', 'materials', 'approval', 'specifications'],
  'PRP - Storage & Transportation': ['storage', 'transportation', 'handling', 'temperature control'],
  'PRP - Waste Management': ['waste', 'disposal', 'containers', 'collection', 'treatment'],
  'PRP - Utilities': ['water', 'air', 'energy', 'utilities', 'quality', 'contamination'],
  'PRP - Chemical Control': ['chemicals', 'lubricants', 'cleaning agents', 'storage', 'msds']
};

/**
 * Analyzes document content and automatically links it to relevant ISO 22000 clauses
 */
export function linkDocumentToClauses(document: DocumentMetadata): string[] {
  const linkedClauses: string[] = [];
  const content = document.content.toLowerCase();
  const name = document.name.toLowerCase();
  const combinedText = `${name} ${content} ${document.tags.join(' ')}`.toLowerCase();

  // Check ISO 22000 clauses
  Object.entries(CLAUSE_KEYWORDS).forEach(([clause, keywords]) => {
    const matches = keywords.filter(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
    
    if (matches.length > 0) {
      linkedClauses.push(clause);
    }
  });

  // Check HACCP principles
  Object.entries(HACCP_KEYWORDS).forEach(([principle, keywords]) => {
    const matches = keywords.filter(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
    
    if (matches.length > 0) {
      linkedClauses.push(principle);
    }
  });

  // Check PRP requirements
  Object.entries(PRP_KEYWORDS).forEach(([prp, keywords]) => {
    const matches = keywords.filter(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
    
    if (matches.length > 0) {
      linkedClauses.push(prp);
    }
  });

  return [...new Set(linkedClauses)]; // Remove duplicates
}

/**
 * Calculates relevance score between document and specific clause
 */
export function calculateRelevanceScore(document: DocumentMetadata, clause: string): number {
  const content = document.content.toLowerCase();
  const name = document.name.toLowerCase();
  const combinedText = `${name} ${content} ${document.tags.join(' ')}`.toLowerCase();

  let keywords: string[] = [];
  
  if (CLAUSE_KEYWORDS[clause as keyof typeof CLAUSE_KEYWORDS]) {
    keywords = CLAUSE_KEYWORDS[clause as keyof typeof CLAUSE_KEYWORDS];
  } else if (HACCP_KEYWORDS[clause as keyof typeof HACCP_KEYWORDS]) {
    keywords = HACCP_KEYWORDS[clause as keyof typeof HACCP_KEYWORDS];
  } else if (PRP_KEYWORDS[clause as keyof typeof PRP_KEYWORDS]) {
    keywords = PRP_KEYWORDS[clause as keyof typeof PRP_KEYWORDS];
  }

  if (keywords.length === 0) return 0;

  const matches = keywords.filter(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );

  return Math.round((matches.length / keywords.length) * 100);
}

/**
 * Suggests relevant documents for a specific audit question
 */
export function suggestDocumentsForQuestion(
  question: AuditQuestion, 
  availableDocuments: DocumentMetadata[]
): DocumentMetadata[] {
  return availableDocuments
    .map(doc => ({
      ...doc,
      relevanceScore: calculateRelevanceScore(doc, question.clause)
    }))
    .filter(doc => doc.relevanceScore > 20) // Only show documents with >20% relevance
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5); // Top 5 most relevant documents
}

/**
 * Auto-populates audit questions with linked documents
 */
export function populateQuestionsWithDocuments(
  questions: AuditQuestion[],
  documents: DocumentMetadata[]
): AuditQuestion[] {
  return questions.map(question => {
    const relevantDocs = suggestDocumentsForQuestion(question, documents);
    return {
      ...question,
      linkedDocuments: relevantDocs.map(doc => doc.name),
      evidence: relevantDocs.length > 0 ? [`Found ${relevantDocs.length} relevant documents`] : question.evidence
    };
  });
}

/**
 * Generates audit completion summary with document analysis
 */
export function generateDetailedAuditReport(
  questions: AuditQuestion[],
  documents: DocumentMetadata[]
) {
  const nonConformantQuestions = questions.filter(q => q.conformance === 'non-conformant');
  const conformantQuestions = questions.filter(q => q.conformance === 'conformant');
  const pendingQuestions = questions.filter(q => q.conformance === 'pending');
  
  // Identify missing documentation
  const questionsWithoutEvidence = questions.filter(q => 
    q.conformance === 'pending' && 
    (!q.linkedDocuments || q.linkedDocuments.length === 0)
  );

  // Group non-conformities by clause
  const nonConformitiesByClause = nonConformantQuestions.reduce((acc, q) => {
    if (!acc[q.clause]) acc[q.clause] = [];
    acc[q.clause].push(q);
    return acc;
  }, {} as Record<string, AuditQuestion[]>);

  return {
    overview: {
      totalQuestions: questions.length,
      completed: questions.length - pendingQuestions.length,
      conformant: conformantQuestions.length,
      nonConformant: nonConformantQuestions.length,
      complianceScore: Math.round((conformantQuestions.length / (questions.length - pendingQuestions.length)) * 100)
    },
    findings: {
      nonConformitiesByClause,
      questionsWithoutEvidence: questionsWithoutEvidence.length,
      documentationGaps: questionsWithoutEvidence.map(q => ({
        clause: q.clause,
        question: q.question,
        suggestedDocuments: suggestDocumentsForQuestion(q, documents)
      }))
    },
    documents: {
      totalDocuments: documents.length,
      linkedDocuments: documents.filter(d => d.linkedClauses.length > 0).length,
      unlinkedDocuments: documents.filter(d => d.linkedClauses.length === 0)
    },
    recommendations: generateRecommendations(nonConformantQuestions, questionsWithoutEvidence)
  };
}

function generateRecommendations(
  nonConformantQuestions: AuditQuestion[],
  questionsWithoutEvidence: AuditQuestion[]
): string[] {
  const recommendations: string[] = [];

  if (nonConformantQuestions.length > 0) {
    recommendations.push(
      `Address ${nonConformantQuestions.length} non-conformities identified during the audit`
    );
  }

  if (questionsWithoutEvidence.length > 0) {
    recommendations.push(
      `Provide documentation for ${questionsWithoutEvidence.length} questions lacking evidence`
    );
  }

  // Specific recommendations based on non-conformities
  const criticalClauses = ['8.4', '8.5', '8.9']; // Hazard analysis, HACCP, Control of nonconformity
  const criticalNCs = nonConformantQuestions.filter(q => 
    criticalClauses.some(clause => q.clause.startsWith(clause))
  );

  if (criticalNCs.length > 0) {
    recommendations.push(
      'Priority: Address critical food safety non-conformities in hazard analysis and HACCP implementation'
    );
  }

  return recommendations;
}
