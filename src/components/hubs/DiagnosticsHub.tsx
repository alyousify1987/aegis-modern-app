import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import { OfflineBanner } from '../../components/OfflineBanner';
import { isOnline, pingApi } from '../../services/net/health';
import { getLogs } from '../../services/obs/logger';
import { listTasks, processQueue, clearAll, deleteTask, retryTask, isProcessingQueue, onQueueChange } from '../../services/net/syncQueue';
import { initDuckDB, query as duckQuery } from '../../services/duckdb/db';
import { extractEntities } from '../../services/ai/nlp';
import { evaluateRules, demoRules } from '../../services/ai/rules';
import { getDexie, seedIfEmpty } from '../../services/db/dexie';

export function DiagnosticsHub(){
  const [online, setOnline] = useState(isOnline());
  const [ping, setPing] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [duckdbStatus, setDuckdbStatus] = useState<'idle'|'ok'|'error'|'running'>('idle');
  const [processing, setProcessing] = useState<boolean>(isProcessingQueue());
  const [duckdbMsg, setDuckdbMsg] = useState<string>('');
  const [aiMsg, setAiMsg] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<'idle'|'ok'|'error'|'running'>('idle');
  const [dbMsg, setDbMsg] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<'idle'|'ok'|'error'|'running'>('idle');

  async function refresh(){
    setOnline(isOnline());
  setPing(await pingApi('/health'));
    setLogs(await getLogs());
    setTasks(await listTasks());
  }

  useEffect(() => {
    void refresh();
    const unsub = onQueueChange(() => setProcessing(isProcessingQueue()));
    return () => { unsub && unsub(); };
  }, []);

  async function testDuckDB(){
    try{
      setDuckdbStatus('running');
      setDuckdbMsg('Initializing...');
      await initDuckDB();
      setDuckdbMsg('Running test query...');
      const r = await duckQuery<{ v: number }>('SELECT 1 AS v');
      setDuckdbStatus('ok');
      setDuckdbMsg(`Result: ${r?.[0]?.v}`);
    } catch(e: any){
      setDuckdbStatus('error');
      setDuckdbMsg(e?.message || String(e));
    }
  }

  async function testAI(){
    try{
      setAiStatus('running');
      setAiMsg('Extracting entities...');
      const ents = await extractEntities('Audit per ISO 9001 on 2025-08-09');
      setAiMsg(`NLP entities: ${ents.map(e=>`${e.type}:${e.value}`).join(', ') || 'none'}`);
      const { events } = await evaluateRules(demoRules, { severity: 'minor', overdue: true });
      setAiMsg(prev => `${prev} | Rules fired: ${events.map(e=>e.type).join(', ') || 'none'}`);
      setAiStatus('ok');
    } catch(e: any){
      setAiStatus('error');
      setAiMsg(e?.message || String(e));
    }
  }

  async function testDexie(){
    try{
      setDbStatus('running');
      setDbMsg('Opening DB...');
      await seedIfEmpty();
      const d = getDexie();
      const count = await d.audits.count();
      setDbMsg(`Dexie audits count: ${count}`);
      setDbStatus('ok');
    } catch(e: any){
      setDbStatus('error');
      setDbMsg(e?.message || String(e));
    }
  }

  return (
    <Box>
      <OfflineBanner />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Diagnostics</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => void refresh()} disabled={processing}>Refresh</Button>
          <Button variant="contained" onClick={async () => { await processQueue(); await refresh(); }} disabled={processing}>Process Queue</Button>
          <Button variant="outlined" color="error" onClick={async () => { await clearAll(); await refresh(); }} disabled={processing}>Clear Queue</Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Network</Typography>
            <Typography>Status: {online ? 'Online' : 'Offline'}</Typography>
            <Typography>Ping /health: {ping === null ? '—' : ping ? 'OK' : 'Fail'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Sync Queue {processing ? '— processing…' : ''} {tasks.length ? `— ${tasks.length} pending` : ''}</Typography>
            <List dense>
              {tasks.map(t => (
                <ListItem key={t.id} secondaryAction={
                  <Box display="flex" gap={1}>
                    <Button size="small" onClick={async ()=>{ await retryTask(t.id); await refresh(); }}>Retry</Button>
                    <Button size="small" color="error" onClick={async ()=>{ await deleteTask(t.id); await refresh(); }}>Delete</Button>
                  </Box>
                }>
                  <ListItemText primary={`${t.method} ${t.path}`} secondary={`attempts: ${t.attempts ?? 0} at ${new Date(t.createdAt).toLocaleString()}`} />
                </ListItem>
              ))}
              {tasks.length === 0 && <Typography color="text.secondary">No pending tasks</Typography>}
            </List>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Logs</Typography>
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {logs.map((l, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={`[${l.level}] ${l.source}`} secondary={`${new Date(l.ts).toLocaleString()} — ${l.message}`} />
                </ListItem>
              ))}
              {logs.length === 0 && <Typography color="text.secondary">No logs</Typography>}
            </List>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">DuckDB</Typography>
                <Button variant="outlined" onClick={() => void testDuckDB()} disabled={duckdbStatus==='running'}>
                  {duckdbStatus==='running' ? 'Running…' : 'Test'}
                </Button>
              </Box>
              <Typography color={duckdbStatus==='error' ? 'error' : 'text.secondary'}>
                {duckdbStatus==='idle' ? 'Idle' : duckdbMsg}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">AI Services</Typography>
                <Button variant="outlined" onClick={() => void testAI()} disabled={aiStatus==='running'}>
                  {aiStatus==='running' ? 'Running…' : 'Test'}
                </Button>
              </Box>
              <Typography color={aiStatus==='error' ? 'error' : 'text.secondary'}>
                {aiStatus==='idle' ? 'Idle' : aiMsg}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Dexie DB</Typography>
                <Button variant="outlined" onClick={() => void testDexie()} disabled={dbStatus==='running'}>
                  {dbStatus==='running' ? 'Running…' : 'Test'}
                </Button>
              </Box>
              <Typography color={dbStatus==='error' ? 'error' : 'text.secondary'}>
                {dbStatus==='idle' ? 'Idle' : dbMsg}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
