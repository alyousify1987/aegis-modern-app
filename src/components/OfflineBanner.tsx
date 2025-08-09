import { Alert, AlertTitle } from '@mui/material';
import { useEffect, useSyncExternalStore, useState } from 'react';
import { isOnline, onOnlineChange } from '../services/net/health';

export function OfflineBanner(){
  const subscribe = (cb: () => void) => onOnlineChange(cb);
  const getSnapshot = () => isOnline();
  const online = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [show, setShow] = useState(!online);
  useEffect(() => { setShow(!online); }, [online]);
  if(online || !show) return null;
  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <AlertTitle>Offline mode</AlertTitle>
      Changes will be queued and synced automatically when connection is restored.
    </Alert>
  );
}
