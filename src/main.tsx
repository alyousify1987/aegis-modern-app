import React, { useEffect, useMemo, useSyncExternalStore } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme as baseTheme } from './theme';
import { isRTL, onLocaleChange } from './services/i18n';
import { ErrorBoundary } from './components/ErrorBoundary';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';
import { registerSW } from 'virtual:pwa-register';
import { ToastProvider } from './components/ToastProvider';

function useLocaleDir() {
  const subscribe = (cb: () => void) => onLocaleChange(cb);
  const getSnapshot = () => (isRTL() ? 'rtl' : 'ltr');
  const dir = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
  }, [dir]);
  return dir;
}

function Root() {
  const dir = useLocaleDir();
  const cache = useMemo(() => createCache({ key: dir === 'rtl' ? 'mui-rtl' : 'mui', stylisPlugins: dir === 'rtl' ? [rtlPlugin] : undefined, prepend: true }), [dir]);
  const theme = useMemo(() => ({ ...baseTheme, direction: dir }), [dir]);
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ToastProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);

// Register service worker for PWA (no-op during dev)
try {
  if (typeof window !== 'undefined') {
    registerSW({ immediate: true, onRegisteredSW() {}, onOfflineReady() {} });
  }
} catch {}
