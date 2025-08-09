import { useEffect } from 'react';
import { processQueue } from './syncQueue';
import { isOnline, onOnlineChange } from './health';
import { useToast } from '../../components/ToastProvider';

// Hook: on reconnect, await queue processing then show a small toast.
export function useSyncCompleteToast(label = 'Sync complete'){
  const { notify } = useToast();
  useEffect(() => {
    const unsub = onOnlineChange(() => {
      if (isOnline()) {
        void (async () => {
          try { await processQueue(); } finally { notify(label, 'success'); }
        })();
      }
    });
    return () => { unsub && unsub(); };
  }, [notify, label]);
}
