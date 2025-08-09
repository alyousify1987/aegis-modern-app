import { useEffect, useState } from 'react';
import { Alert, Button, Collapse } from '@mui/material';

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: 'accepted'|'dismissed' }> };

export function InstallBanner(){
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onPrompt = (e: Event) => {
      (e as any).preventDefault?.();
      setEvt(e as BIPEvent);
      setOpen(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt as any);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt as any);
  }, []);
  if(!evt) return null;
  return (
    <Collapse in={open}>
      <Alert
        severity="info"
        action={<Button color="inherit" size="small" onClick={async () => { await evt.prompt(); setOpen(false); }}>Install</Button>}
        sx={{ mb: 2 }}
      >
        Install Aegis as an app for faster access and offline support.
      </Alert>
    </Collapse>
  );
}
