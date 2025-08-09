import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { AuditHub } from './components/hubs/AuditHub.tsx';
import ComplianceHub from './components/hubs/ComplianceHub.tsx';
import { RiskHub } from './components/hubs/RiskHub.tsx';
import { ActionHub } from './components/hubs/ActionHub.tsx';
import { KnowledgeHub } from './components/hubs/KnowledgeHub.tsx';
import { AnalyticsHub } from './components/hubs/AnalyticsHub.tsx';
import { Layout } from './components/Layout.tsx';
import { DiagnosticsHub } from './components/hubs/DiagnosticsHub.tsx';
import { DocumentsHub } from './components/hubs/DocumentsHub.tsx';
import { NcrHub } from './components/hubs/NcrHub.tsx';
import { Login } from './components/Login.tsx';
import type { CurrentView } from './types/index.ts';
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('aegis_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('aegis_token');
  // Clear in-memory encryption key
  import('./services/db/secure').then(m => m.clearPassphrase?.());
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'audit':
        return <AuditHub />;
      case 'compliance':
        return <ComplianceHub />;
      case 'risk':
        return <RiskHub />;
      case 'documents':
        return <DocumentsHub />;
      case 'ncrs':
        return <NcrHub />;
      case 'actions':
        return <ActionHub />;
      case 'knowledge':
        return <KnowledgeHub />;
      case 'analytics':
        return <AnalyticsHub />;
      case 'diagnostics':
        return <DiagnosticsHub />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout}>
      {renderCurrentView()}
    </Layout>
  );
}

export default App;
