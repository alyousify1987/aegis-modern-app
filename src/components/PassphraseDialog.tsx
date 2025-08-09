import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { setPassphrase } from '../services/db/secure';

export function PassphraseDialog({ open, onClose }: { open: boolean; onClose: () => void }){
  const [value, setValue] = useState('');
  const [remember, setRemember] = useState(true);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Encryption Passphrase</DialogTitle>
      <DialogContent>
        <TextField fullWidth autoFocus label="Passphrase" type="password" value={value} onChange={e => setValue(e.target.value)} />
        <FormControlLabel sx={{ mt: 1 }} control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} />} label="Remember for this session" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => { if(value) setPassphrase(value, { rememberForSession: remember }); onClose(); }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
