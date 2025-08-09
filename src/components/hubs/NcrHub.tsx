import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { evaluateRules, demoRules } from '../../services/ai/rules';
import { apiJson } from '../../utils/api';
import { isOnline, onOnlineChange } from '../../services/net/health';
import { enqueue as enqueueSync, processQueue } from '../../services/net/syncQueue';

export function NcrHub(){
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');

  async function refresh(){
    try{
      const json = await apiJson<{ data: any[] }>('/api/ncrs');
      setNcrs(Array.isArray(json.data) ? json.data : []);
      setStatus('');
    }catch(e:any){ setStatus(e?.message||String(e)); }
  }

  useEffect(()=>{ void refresh(); },[]);

  // When back online, process queue then reload from server
  useEffect(() => {
    const unsub = onOnlineChange(() => {
      if (isOnline()) {
        void (async () => {
          try { await processQueue(); } finally { await refresh(); }
        })();
      }
    });
    return () => { unsub && unsub(); };
  }, []);

  // Hidden test hook similar to ActionHub
  useEffect(() => {
    (window as any).__forceQueueProcessNcr = async () => {
      await processQueue();
      await refresh();
    };
    return () => { try { delete (window as any).__forceQueueProcessNcr; } catch {} };
  }, []);

  async function raiseMockNcr(){
    try{
      const facts = { severity: 'minor', overdue: Math.random() > 0.5 };
      const { events } = await evaluateRules(demoRules, facts);
      const severity = events.length ? 'major' : 'minor';
      if (!isOnline()){
        // Optimistic add + queue
        const temp = { id: `temp_ncr_${Date.now()}`, title: 'Mock NCR', severity, status: 'open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setNcrs(prev => [temp, ...prev]);
        await enqueueSync({ method: 'POST', path: '/api/ncrs', body: { title: 'Mock NCR', severity, status: 'open' } });
        setStatus('Raised mock NCR');
        return;
      }
      const json = await apiJson<{ data: any }>(
        '/api/ncrs',
        { method: 'POST', body: JSON.stringify({ title: 'Mock NCR', severity, status: 'open' }) }
      );
      if (json?.data){ setNcrs(prev => [json.data, ...prev]); }
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
          <Typography variant="h6" component="div" data-testid="ncr-total-value" sx={{ display: 'none' }}>{ncrs.length}</Typography>
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
