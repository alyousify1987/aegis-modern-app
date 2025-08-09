import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { getDexieAsync } from '../../services/db/dexie';
import { evaluateRules, demoRules } from '../../services/ai/rules';

export function NcrHub(){
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');

  async function refresh(){
    try{
  const db = await getDexieAsync();
      const all = db ? await db.table('ncrs').toArray() : [];
      setNcrs(all);
    }catch(e:any){ setStatus(e?.message||String(e)); }
  }

  useEffect(()=>{ void refresh(); },[]);

  async function raiseMockNcr(){
    try{
  const db = await getDexieAsync();
      const id = `ncr_${Date.now()}`;
      const facts = { severity: 'minor', overdue: Math.random() > 0.5 };
      const { events } = await evaluateRules(demoRules, facts);
      const severity = events.length ? 'major' : 'minor';
      await db.table('ncrs').add({ id, title: 'Mock NCR', severity, status: 'open', createdAt: Date.now(), updatedAt: Date.now() });
  await refresh();
  setStatus('Raised mock NCR');
    }catch(e:any){ setStatus(e?.message||String(e)); }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Non-Conformance & CAPA</Typography>
        <Box display="flex" gap={1}>
          <Button variant="contained" onClick={() => void raiseMockNcr()}>Raise Mock NCR</Button>
          <Button variant="outlined" onClick={() => void refresh()}>Refresh</Button>
        </Box>
      </Box>
      <Card>
        <CardContent>
          <Typography color="text.secondary" mb={2} data-testid="ncr-status">{status || `Total: ${ncrs.length}`}</Typography>
          <List dense data-testid="ncr-list">
            {ncrs.map(n => (
              <ListItem key={n.id} secondaryAction={<Chip size="small" label={n.severity} color={n.severity==='major'?'error':'warning'} />}>
                <ListItemText primary={n.title} secondary={`${n.status} — ${new Date(n.createdAt).toLocaleString()}`} />
              </ListItem>
            ))}
            {ncrs.length===0 && <Typography color="text.secondary">No NCRs</Typography>}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
