// Minimal, headless i18n scaffold with RTL support
// No framework bindings; consumers can subscribe to changes.

export type Locale = 'en' | 'fr' | 'ar';

const messages: Record<Locale, Record<string, string>> = {
  en: {
    app_title: 'Aegis Audit',
    menu_dashboard: 'Dashboard',
    menu_audit: 'Audit Hub',
    menu_compliance: 'Compliance Hub',
    menu_risk: 'Risk Hub',
    menu_actions: 'Action Hub',
    menu_knowledge: 'Knowledge Hub',
  menu_analytics: 'Analytics Hub',
  menu_diagnostics: 'Diagnostics',
  analytics_title: 'Analytics & Reporting Hub',
  time_range: 'Time Range',
  filters: 'Filters',
  export: 'Export',
  recent_audit_performance: 'Recent Audit Performance',
  compliance_by_standard: 'Compliance by Standard',
  },
  fr: {
    app_title: 'Audit Aegis',
    menu_dashboard: 'Tableau de bord',
    menu_audit: 'Pôle Audit',
    menu_compliance: 'Pôle Conformité',
    menu_risk: 'Pôle Risques',
    menu_actions: 'Pôle Actions',
    menu_knowledge: 'Pôle Connaissance',
  menu_analytics: 'Pôle Analytique',
  menu_diagnostics: 'Diagnostics',
  analytics_title: 'Pôle Analytique et Rapports',
  time_range: 'Plage de temps',
  filters: 'Filtres',
  export: 'Exporter',
  recent_audit_performance: 'Performance des audits récents',
  compliance_by_standard: 'Conformité par référentiel',
  },
  ar: {
    app_title: 'إيجيس للتدقيق',
    menu_dashboard: 'لوحة التحكم',
    menu_audit: 'مركز التدقيق',
    menu_compliance: 'مركز الامتثال',
    menu_risk: 'مركز المخاطر',
    menu_actions: 'مركز الإجراءات',
    menu_knowledge: 'مركز المعرفة',
  menu_analytics: 'مركز التحليلات',
  menu_diagnostics: 'التشخيص',
  analytics_title: 'مركز التحليلات والتقارير',
  time_range: 'النطاق الزمني',
  filters: 'مرشحات',
  export: 'تصدير',
  recent_audit_performance: 'أداء التدقيقات الأخيرة',
  compliance_by_standard: 'الامتثال حسب المعيار',
  },
};

const stored = typeof window !== 'undefined' ? localStorage.getItem('aegis_locale') as Locale | null : null;
let currentLocale: Locale = stored && ['en','fr','ar'].includes(stored) ? stored as Locale : 'en';
let subscribers = new Set<() => void>();

export function setLocale(locale: Locale) {
  if (currentLocale !== locale) {
    currentLocale = locale;
  try { localStorage.setItem('aegis_locale', locale); } catch {}
    subscribers.forEach((cb) => cb());
  }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string): string {
  return messages[currentLocale]?.[key] ?? messages.en[key] ?? key;
}

export function isRTL(): boolean {
  return currentLocale === 'ar';
}

export function onLocaleChange(cb: () => void) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
