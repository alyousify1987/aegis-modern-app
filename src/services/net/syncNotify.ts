import { useEffect } from 'react';
import { processQueue, listTasks } from './syncQueue';
import { isOnline, onOnlineChange } from './health';
import { useToast } from '../../components/ToastProvider';

// Hook: on reconnect, await queue processing then show a small toast.
// Prevent duplicate toasts when multiple components use this hook
let notifyInFlight = false;
let lastNotifyTs = 0;
const DEDUPE_WINDOW_MS = 4000;

export function useSyncCompleteToast(label = 'Sync complete'){
  const { notify } = useToast();
  useEffect(() => {
    const unsub = onOnlineChange(() => {
      if (!isOnline()) return;
      if (notifyInFlight) return;
      const now = Date.now();
      if (now - lastNotifyTs < DEDUPE_WINDOW_MS) return;
      notifyInFlight = true;
      void (async () => {
        try {
          const before = (await listTasks()).length;
          if (before === 0) return; // nothing to sync, stay quiet
          await processQueue();
          const after = (await listTasks()).length;
          const processed = Math.max(0, before - after);
          if (processed > 0) {
            const suffix = processed === 1 ? ' (1 item)' : ` (${processed} items)`;
            notify(`${label}${suffix}`, 'success');
          }
        } finally {
          lastNotifyTs = Date.now();
          notifyInFlight = false;
        }
      })();
    });
    return () => { unsub && unsub(); };
  }, [notify, label]);
}
