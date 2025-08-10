/// <reference path="../../types/file-system-access.d.ts" />
// One-Click Audit Service - RFP Requirement for automated folder ingestion

// Type assertion for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite';
    }): Promise<FileSystemDirectoryHandle>;
  }

  interface FileSystemDirectoryHandle {
    readonly kind: 'directory';
    readonly name: string;
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  }

  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<File>;
  }
}

// Interfaces
import { extractEntities, classifyText } from '../ai/nlp';
import { extractDocumentText } from '../ai/ocr';
import { evaluateRules } from '../ai/rules';

export interface AuditFile {
  name: string;
  path: string;
  size: number;
  type: string;
  content?: string;
  extractedText?: string;
  entities?: Array<{ type: string; value: string }>;
  classification?: { intent: string; confidence: number };
  linkedChecklistItems?: string[];
  assessment?: 'conformed' | 'non_conformed' | 'observation' | 'not_applicable';
  confidence?: number;
}

export interface ChecklistItem {
  id: string;
  clause: string;
  requirement: string;
  category: 'major' | 'minor' | 'observation';
  linkedFiles: string[];
  assessment: 'conformed' | 'non_conformed' | 'observation' | 'not_applicable' | 'pending';
  automaticAssessment?: boolean;
  auditorOverride?: {
    assessment: 'conformed' | 'non_conformed' | 'observation' | 'not_applicable';
    reason: string;
    timestamp: Date;
  };
  evidence: Array<{
    fileId: string;
    relevanceScore: number;
    extractedData: any;
  }>;
}

export interface OneClickAuditResult {
  totalFiles: number;
  processedFiles: number;
  checklist: ChecklistItem[];
  files: AuditFile[];
  processingTime: number;
  warnings: string[];
  errors: string[];
}

// Check if File System Access API is available
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window;
}

// Dynamic checklist generation based on audit scope and risk
export function generateDynamicChecklist(
  _auditScope: string,
  riskLevel: 'easy' | 'medium' | 'extensive',
  standard: 'ISO_22000' | 'HACCP' | 'ISO_9001' | 'custom'
): ChecklistItem[] {
  const baseItems: Partial<ChecklistItem>[] = [];
  
  // ISO 22000 specific items
  if (standard === 'ISO_22000') {
    baseItems.push(
      {
        clause: '4.1',
        requirement: 'Understanding the organization and its context',
        category: 'major'
      },
      {
        clause: '7.2',
        requirement: 'Competence of personnel',
        category: 'major'
      },
      {
        clause: '8.2',
        requirement: 'Prerequisite programmes (PRPs)',
        category: 'major'
      },
      {
        clause: '8.5.2',
        requirement: 'Hazard identification and hazard assessment',
        category: 'major'
      },
      {
        clause: '8.5.4',
        requirement: 'HACCP plan',
        category: 'major'
      },
      {
        clause: '9.1',
        requirement: 'Monitoring and measurement',
        category: 'minor'
      },
      {
        clause: '9.2',
        requirement: 'Internal audit',
        category: 'minor'
      },
      {
        clause: '10.1',
        requirement: 'Nonconformity and corrective action',
        category: 'major'
      }
    );
  }
  
  // Add more items based on risk level
  if (riskLevel === 'extensive') {
    baseItems.push(
      {
        clause: '7.1.1',
        requirement: 'General resources',
        category: 'observation'
      },
      {
        clause: '7.1.2',
        requirement: 'People',
        category: 'observation'
      },
      {
        clause: '8.3',
        requirement: 'Traceability system',
        category: 'major'
      }
    );
  }
  
  return baseItems.map((item, index) => ({
    id: `checklist_${index + 1}`,
    clause: item.clause!,
    requirement: item.requirement!,
    category: item.category!,
    linkedFiles: [],
    assessment: 'pending' as const,
    evidence: []
  }));
}

// Main one-click audit function
export async function performOneClickAudit(
  auditScope: string,
  riskLevel: 'easy' | 'medium' | 'extensive',
  standard: 'ISO_22000' | 'HACCP' | 'ISO_9001' | 'custom' = 'ISO_22000'
): Promise<OneClickAuditResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    // Check if File System Access API is supported
    if (!isFileSystemAccessSupported()) {
      throw new Error('File System Access API not supported in this browser');
    }
    
    // Prompt user to select directory
    const directoryHandle = await window.showDirectoryPicker({
      mode: 'read'
    });
    
    // Generate dynamic checklist
    const checklist = generateDynamicChecklist(auditScope, riskLevel, standard);
    
    // Process directory recursively
    const files: AuditFile[] = [];
    await processDirectory(directoryHandle, files, '');
    
    // Process each file
    let processedCount = 0;
    for (const file of files) {
      try {
        await processAuditFile(file);
        processedCount++;
      } catch (error) {
        errors.push(`Failed to process ${file.name}: ${error}`);
      }
    }
    
    // Link evidence to checklist items
    linkEvidenceToChecklist(files, checklist);
    
    // Perform automated assessments
    await performAutomatedAssessments(checklist, files);
    
    const processingTime = Date.now() - startTime;
    
    return {
      totalFiles: files.length,
      processedFiles: processedCount,
      checklist,
      files,
      processingTime,
      warnings,
      errors
    };
    
  } catch (error) {
    errors.push(`One-click audit failed: ${error}`);
    return {
      totalFiles: 0,
      processedFiles: 0,
      checklist: [],
      files: [],
      processingTime: Date.now() - startTime,
      warnings,
      errors
    };
  }
}

// Recursive directory processing
async function processDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  files: AuditFile[],
  currentPath: string
): Promise<void> {
  for await (const [name, handle] of directoryHandle.entries()) {
    const fullPath = currentPath ? `${currentPath}/${name}` : name;
    
    if (handle.kind === 'file') {
      const fileHandle = handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      files.push({
        name: file.name,
        path: fullPath,
        size: file.size,
        type: file.type,
        content: await readFileContent(file)
      });
    } else if (handle.kind === 'directory') {
      const dirHandle = handle as FileSystemDirectoryHandle;
      await processDirectory(dirHandle, files, fullPath);
    }
  }
}

// Read file content based on type
async function readFileContent(file: File): Promise<string> {
  if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    return await file.text();
  } else if (file.type === 'application/pdf') {
    // For PDF files, we would use a PDF parser here
    return '[PDF content - OCR/parsing would be applied]';
  } else if (file.type.startsWith('image/')) {
    // For images, we'll use OCR
    return '[Image content - OCR processing required]';
  }
  return '[Binary file - content extraction not supported]';
}

// Process individual audit file
async function processAuditFile(file: AuditFile): Promise<void> {
  try {
    // Extract text from images using OCR
    if (file.type.startsWith('image/') && file.content) {
      // Convert content to blob for OCR processing
      // This is a simplified version - in reality, we'd need the actual file
      const ocrResult = await extractDocumentText(new File([file.content], file.name, { type: file.type }));
      file.extractedText = ocrResult.text;
    } else {
      file.extractedText = file.content;
    }
    
    // Extract entities from text content
    if (file.extractedText) {
      file.entities = await extractEntities(file.extractedText);
      file.classification = await classifyText(file.extractedText);
    }
    
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
  }
}

// Link evidence to appropriate checklist items
function linkEvidenceToChecklist(files: AuditFile[], checklist: ChecklistItem[]): void {
  for (const file of files) {
    if (!file.entities || !file.extractedText) continue;
    
    for (const item of checklist) {
      const relevanceScore = calculateRelevanceScore(file, item);
      
      if (relevanceScore > 0.3) { // Threshold for relevance
        item.linkedFiles.push(file.path);
        item.evidence.push({
          fileId: file.path,
          relevanceScore,
          extractedData: {
            entities: file.entities,
            classification: file.classification,
            extractedText: file.extractedText?.substring(0, 500) // First 500 chars
          }
        });
        
        if (!file.linkedChecklistItems) {
          file.linkedChecklistItems = [];
        }
        file.linkedChecklistItems.push(item.id);
      }
    }
  }
}

// Calculate relevance score between file and checklist item
function calculateRelevanceScore(file: AuditFile, item: ChecklistItem): number {
  let score = 0;
  
  if (!file.extractedText || !file.entities) return 0;
  
  const text = file.extractedText.toLowerCase();
  const requirement = item.requirement.toLowerCase();
  const clause = item.clause.toLowerCase();
  
  // Check for clause number
  if (text.includes(clause)) {
    score += 0.4;
  }
  
  // Check for requirement keywords
  const requirementWords = requirement.split(' ').filter(word => word.length > 3);
  const matchingWords = requirementWords.filter(word => text.includes(word.toLowerCase()));
  score += (matchingWords.length / requirementWords.length) * 0.4;
  
  // Check entities
  if (file.entities) {
    const relevantEntities = file.entities.filter(entity => 
      entity.type === 'standard' || 
      entity.type === 'clause' || 
      entity.type === 'finding_severity'
    );
    score += Math.min(relevantEntities.length * 0.1, 0.2);
  }
  
  return Math.min(score, 1.0);
}

// Perform automated assessments using rule engine
async function performAutomatedAssessments(checklist: ChecklistItem[], _files: AuditFile[]): Promise<void> {
  const assessmentRules = [
    {
      conditions: {
        all: [
          { fact: 'evidenceCount', operator: 'greaterThan', value: 0 },
          { fact: 'highConfidenceEvidence', operator: 'greaterThan', value: 0 }
        ]
      },
      event: { type: 'assess-conformed', params: { confidence: 0.8 } }
    },
    {
      conditions: {
        any: [
          { fact: 'evidenceCount', operator: 'equal', value: 0 },
          { fact: 'negativeIndicators', operator: 'greaterThan', value: 0 }
        ]
      },
      event: { type: 'assess-non-conformed', params: { confidence: 0.7 } }
    }
  ];
  
  for (const item of checklist) {
    const facts = {
      evidenceCount: item.evidence.length,
      highConfidenceEvidence: item.evidence.filter(e => e.relevanceScore > 0.7).length,
      negativeIndicators: item.evidence.filter(e => 
        e.extractedData.entities?.some((entity: any) => 
          entity.type === 'finding_severity' && 
          ['non-conformity', 'deficiency', 'gap'].some(neg => entity.value.toLowerCase().includes(neg))
        )
      ).length
    };
    
    try {
      const { events } = await evaluateRules(assessmentRules, facts);
      
      if (events.length > 0) {
        const event = events[0];
        item.automaticAssessment = true;
        
        if (event.type === 'assess-conformed') {
          item.assessment = 'conformed';
        } else if (event.type === 'assess-non-conformed') {
          item.assessment = 'non_conformed';
        }
      } else {
        item.assessment = 'observation'; // Default for unclear cases
      }
    } catch (error) {
      console.error('Assessment rule evaluation failed:', error);
      item.assessment = 'pending';
    }
  }
}

// Allow auditor to override automatic assessments
export function overrideAssessment(
  checklistItem: ChecklistItem,
  newAssessment: 'conformed' | 'non_conformed' | 'observation' | 'not_applicable',
  reason: string
): void {
  checklistItem.auditorOverride = {
    assessment: newAssessment,
    reason,
    timestamp: new Date()
  };
  checklistItem.assessment = newAssessment;
}
