import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

type Toast = { id: string; message: string; severity?: 'success'|'info'|'warning'|'error' };
type ToastCtx = { notify: (message: string, severity?: Toast['severity']) => void };

const Ctx = createContext<ToastCtx>({ notify: () => {} });

export function useToast(){ return useContext(Ctx); }

export function ToastProvider({ children }: { children: React.ReactNode }){
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const notify = useCallback((message: string, severity: Toast['severity'] = 'info') => {
    setToast({ id: `${Date.now()}`, message, severity });
    setOpen(true);
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <Snackbar open={open} autoHideDuration={3500} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setOpen(false)} severity={toast?.severity || 'info'} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Ctx.Provider>
  );
}
