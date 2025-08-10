// Core Types for Aegis Audit Platform
// Based on RFP-COMPREHENSIVE.md specifications

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  profilePicture?: string;
  digitalSignature?: string;
  skills: string[];
  certifications: Certification[];
  preferences: UserPreferences;
  trustScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  dashboardLayout: DashboardWidget[];
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  auditReminders: boolean;
  complianceAlerts: boolean;
  actionDeadlines: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate?: Date;
  documentUrl?: string;
}

export type UserRole = 'admin' | 'auditor' | 'manager' | 'viewer' | 'compliance_officer';
export type CurrentView = 'dashboard' | 'audit' | 'compliance' | 'documents' | 'ncrs' | 'risk' | 'actions' | 'knowledge' | 'analytics' | 'diagnostics' | 'objectives' | 'external-auditor' | 'management-review' | 'internal-auditor' | 'ai-assistant';

export interface Audit {
  id: string;
  title: string;
  description?: string;
  type: AuditType;
  standard: StandardType;
  status: AuditStatus;
  scope: string;
  startDate: Date;
  endDate?: Date;
  leadAuditor: string;
  auditors: string[];
  auditees: string[];
  findings: Finding[];
  evidence: Evidence[];
  riskScore?: number;
  complianceScore?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuditType = 'internal' | 'supplier' | 'regulatory' | 'certification';
export type StandardType = 'ISO_22000' | 'HACCP' | 'SFDA' | 'ISO_9001' | 'ISO_14001' | 'ISO_45001' | 'custom';
export type AuditStatus = 'draft' | 'planned' | 'in_progress' | 'review' | 'completed' | 'cancelled';

export interface Finding {
  id: string;
  auditId: string;
  clause: string;
  category: FindingCategory;
  severity: Severity;
  description: string;
  recommendation: string;
  evidence: string[];
  rootCause?: string;
  aiSuggestion?: string;
  status: FindingStatus;
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type FindingCategory = 'major_nonconformity' | 'minor_nonconformity' | 'observation' | 'opportunity_for_improvement';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'in_progress' | 'completed' | 'verified' | 'closed';

export interface Evidence {
  id: string;
  type: EvidenceType;
  name: string;
  description?: string;
  url: string;
  metadata: EvidenceMetadata;
  uploadedBy: string;
  uploadedAt: Date;
}

export type EvidenceType = 'document' | 'photo' | 'video' | 'audio' | 'file';

export interface EvidenceMetadata {
  size: number;
  mimeType: string;
  checksum?: string;
  ocrText?: string;
  aiAnalysis?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  likelihood: RiskLevel;
  impact: RiskLevel;
  riskScore: number;
  status: RiskStatus;
  owner: string;
  mitigationPlan?: string;
  controls: Control[];
  linkedAudits: string[];
  linkedActions: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RiskCategory = 'operational' | 'financial' | 'regulatory' | 'reputational' | 'strategic' | 'food_safety';
export type RiskLevel = 1 | 2 | 3 | 4 | 5;
export type RiskStatus = 'identified' | 'assessing' | 'mitigating' | 'monitoring' | 'closed';

export interface Control {
  id: string;
  name: string;
  description: string;
  type: ControlType;
  effectiveness: ControlEffectiveness;
  frequency: string;
  responsible: string;
  lastTested?: Date;
  nextTest?: Date;
}

export type ControlType = 'preventive' | 'detective' | 'corrective';
export type ControlEffectiveness = 'effective' | 'partially_effective' | 'ineffective' | 'not_tested';

export interface Action {
  id: string;
  title: string;
  description: string;
  type: ActionType;
  priority: Priority;
  status: ActionStatus;
  assignedTo: string;
  createdBy: string;
  dueDate: Date;
  completedDate?: Date;
  linkedFindings: string[];
  linkedRisks: string[];
  linkedAudits: string[];
  progress: number; // 0-100
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export type ActionType = 'corrective' | 'preventive' | 'improvement';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'open' | 'in_progress' | 'completed' | 'overdue' | 'escalated';

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  attachments?: string[];
}

export interface ComplianceItem {
  id: string;
  standard: StandardType;
  clause: string;
  requirement: string;
  status: ComplianceStatus;
  evidence: string[];
  lastAssessed?: Date;
  nextAssessment?: Date;
  responsible: string;
  gaps?: string[];
  recommendations?: string[];
}

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  category: string[];
  tags: string[];
  standard?: StandardType;
  author: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type KnowledgeType = 'article' | 'procedure' | 'checklist' | 'training' | 'scenario' | 'best_practice';

export interface AuditScenario {
  id: string;
  title: string;
  description: string;
  standard: StandardType;
  clause: string;
  finding: string;
  recommendedAction: string;
  severity: Severity;
  category: string[];
  tags: string[];
  confidence: number; // AI confidence score
  usage_count: number;
  effectiveness_rating: number;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

export type WidgetType = 
  | 'audit_summary' 
  | 'compliance_status' 
  | 'risk_heatmap' 
  | 'action_tracker' 
  | 'recent_findings' 
  | 'upcoming_audits'
  | 'training_progress'
  | 'kpi_metrics';

export interface AIAnalysis {
  confidence: number;
  reasoning: string;
  recommendations: string[];
  alternatives: string[];
  sources: string[];
  generated_at: Date;
}

export interface Draft {
  id: string;
  userId: string;
  type: 'audit' | 'report' | 'checklist' | 'action' | 'risk';
  data: Record<string, any>;
  status: 'draft' | 'submitted';
  auto_saved_at: Date;
  manual_saved_at?: Date;
  created_at: Date;
  updated_at: Date;
}
