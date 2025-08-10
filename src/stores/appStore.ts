import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Core application state types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'auditor' | 'manager' | 'viewer' | 'compliance_officer';
  department?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: 'en' | 'fr' | 'ar';
    dashboardLayout: any[];
  };
}

export interface Audit {
  id: string;
  title: string;
  type: 'internal' | 'supplier' | 'regulatory' | 'certification';
  status: 'draft' | 'planned' | 'in_progress' | 'review' | 'completed';
  startDate: Date;
  endDate?: Date;
  findings: Finding[];
}

export interface Finding {
  id: string;
  auditId: string;
  category: 'major_nonconformity' | 'minor_nonconformity' | 'observation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'verified' | 'closed';
}

export interface NonConformance {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'action_planned' | 'implementing' | 'closed';
  department: string;
  raisedBy: string;
  dueDate: Date;
}

export interface Risk {
  id: string;
  title: string;
  category: 'operational' | 'financial' | 'regulatory' | 'reputational';
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  status: 'identified' | 'assessing' | 'mitigating' | 'monitoring' | 'closed';
}

export interface Action {
  id: string;
  title: string;
  type: 'corrective' | 'preventive' | 'improvement';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  dueDate: Date;
  progress: number;
}

// Application State Interface
interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  
  // UI State
  currentView: string;
  theme: 'light' | 'dark';
  language: 'en' | 'fr' | 'ar';
  sidebarOpen: boolean;
  
  // Data State
  audits: Audit[];
  findings: Finding[];
  nonConformances: NonConformance[];
  risks: Risk[];
  actions: Action[];
  documents: any[];
  
  // Loading States
  loading: {
    audits: boolean;
    findings: boolean;
    nonConformances: boolean;
    risks: boolean;
    actions: boolean;
    documents: boolean;
  };
  
  // Error States
  errors: {
    [key: string]: string | null;
  };
}

// Application Actions Interface
interface AppActions {
  // Authentication Actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  
  // UI Actions
  setCurrentView: (view: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'fr' | 'ar') => void;
  toggleSidebar: () => void;
  
  // Data Actions
  addAudit: (audit: Audit) => void;
  updateAudit: (id: string, updates: Partial<Audit>) => void;
  deleteAudit: (id: string) => void;
  
  addFinding: (finding: Finding) => void;
  updateFinding: (id: string, updates: Partial<Finding>) => void;
  deleteFinding: (id: string) => void;
  
  addNonConformance: (ncr: NonConformance) => void;
  updateNonConformance: (id: string, updates: Partial<NonConformance>) => void;
  deleteNonConformance: (id: string) => void;
  
  addRisk: (risk: Risk) => void;
  updateRisk: (id: string, updates: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  
  addAction: (action: Action) => void;
  updateAction: (id: string, updates: Partial<Action>) => void;
  deleteAction: (id: string) => void;
  
  // Loading Actions
  setLoading: (key: keyof AppState['loading'], loading: boolean) => void;
  
  // Error Actions
  setError: (key: string, error: string | null) => void;
  clearErrors: () => void;
  
  // Bulk Actions
  loadInitialData: () => Promise<void>;
  syncData: () => Promise<void>;
}

// Combined Store Type
type AppStore = AppState & AppActions;

// Initial State
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  currentView: 'dashboard',
  theme: 'dark',
  language: 'en',
  sidebarOpen: true,
  audits: [],
  findings: [],
  nonConformances: [],
  risks: [],
  actions: [],
  documents: [],
  loading: {
    audits: false,
    findings: false,
    nonConformances: false,
    risks: false,
    actions: false,
    documents: false,
  },
  errors: {},
};

// Create the Zustand store with persistence
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Authentication Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, currentView: 'dashboard' }),
      
      // UI Actions
      setCurrentView: (view) => set({ currentView: view }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Data Actions
      addAudit: (audit) => set((state) => ({ audits: [...state.audits, audit] })),
      updateAudit: (id, updates) => 
        set((state) => ({
          audits: state.audits.map(audit => 
            audit.id === id ? { ...audit, ...updates } : audit
          )
        })),
      deleteAudit: (id) => 
        set((state) => ({ audits: state.audits.filter(audit => audit.id !== id) })),
      
      addFinding: (finding) => set((state) => ({ findings: [...state.findings, finding] })),
      updateFinding: (id, updates) =>
        set((state) => ({
          findings: state.findings.map(finding =>
            finding.id === id ? { ...finding, ...updates } : finding
          )
        })),
      deleteFinding: (id) =>
        set((state) => ({ findings: state.findings.filter(finding => finding.id !== id) })),
      
      addNonConformance: (ncr) => set((state) => ({ nonConformances: [...state.nonConformances, ncr] })),
      updateNonConformance: (id, updates) =>
        set((state) => ({
          nonConformances: state.nonConformances.map(ncr =>
            ncr.id === id ? { ...ncr, ...updates } : ncr
          )
        })),
      deleteNonConformance: (id) =>
        set((state) => ({ nonConformances: state.nonConformances.filter(ncr => ncr.id !== id) })),
      
      addRisk: (risk) => set((state) => ({ risks: [...state.risks, risk] })),
      updateRisk: (id, updates) =>
        set((state) => ({
          risks: state.risks.map(risk =>
            risk.id === id ? { ...risk, ...updates } : risk
          )
        })),
      deleteRisk: (id) =>
        set((state) => ({ risks: state.risks.filter(risk => risk.id !== id) })),
      
      addAction: (action) => set((state) => ({ actions: [...state.actions, action] })),
      updateAction: (id, updates) =>
        set((state) => ({
          actions: state.actions.map(action =>
            action.id === id ? { ...action, ...updates } : action
          )
        })),
      deleteAction: (id) =>
        set((state) => ({ actions: state.actions.filter(action => action.id !== id) })),
      
      // Loading Actions
      setLoading: (key, loading) =>
        set((state) => ({ loading: { ...state.loading, [key]: loading } })),
      
      // Error Actions
      setError: (key, error) =>
        set((state) => ({ errors: { ...state.errors, [key]: error } })),
      clearErrors: () => set({ errors: {} }),
      
      // Bulk Actions
      loadInitialData: async () => {
        const state = get();
        try {
          state.setLoading('audits', true);
          state.setLoading('findings', true);
          state.setLoading('nonConformances', true);
          state.setLoading('risks', true);
          state.setLoading('actions', true);
          
          // Simulate loading data from IndexedDB
          // In real implementation, this would call the database services
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock data would be loaded here
          state.setLoading('audits', false);
          state.setLoading('findings', false);
          state.setLoading('nonConformances', false);
          state.setLoading('risks', false);
          state.setLoading('actions', false);
        } catch (error) {
          state.setError('loadData', 'Failed to load initial data');
          state.setLoading('audits', false);
          state.setLoading('findings', false);
          state.setLoading('nonConformances', false);
          state.setLoading('risks', false);
          state.setLoading('actions', false);
        }
      },
      
      syncData: async () => {
        // Sync data with backend when online
        try {
          // Implementation would sync with server
          console.log('Syncing data...');
        } catch (error) {
          get().setError('sync', 'Failed to sync data');
        }
      }
    }),
    {
      name: 'aegis-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        language: state.language,
        currentView: state.currentView,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Selectors for common data queries
export const useAudits = () => useAppStore((state) => state.audits);
export const useFindings = () => useAppStore((state) => state.findings);
export const useNonConformances = () => useAppStore((state) => state.nonConformances);
export const useRisks = () => useAppStore((state) => state.risks);
export const useActions = () => useAppStore((state) => state.actions);
export const useCurrentUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useCurrentView = () => useAppStore((state) => state.currentView);
export const useTheme = () => useAppStore((state) => state.theme);
export const useLanguage = () => useAppStore((state) => state.language);
export const useLoading = () => useAppStore((state) => state.loading);
export const useErrors = () => useAppStore((state) => state.errors);
