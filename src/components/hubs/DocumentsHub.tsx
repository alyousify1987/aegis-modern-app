import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { getDexieAsync } from '../../services/db/dexie';
import { extractEntities } from '../../services/ai/nlp';

export function DocumentsHub(){
  const [docs, setDocs] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');

  async function refresh(){
    try{
  const db = await getDexieAsync();
      const all = db ? await db.table('documents').toArray() : [];
      setDocs(all);
    }catch(e:any){ setStatus(e?.message||String(e)); }
  }

  useEffect(()=>{ void refresh(); },[]);

  async function ingestMock(){
    // Mock ingestion: simulate OCR/NLP tagging
    try{
      setStatus('Ingesting…');
  const db = await getDexieAsync();
      const id = `doc_${Date.now()}`;
      const name = 'Quality Manual v1.pdf';
      const text = 'Quality Manual aligned to ISO 9001 (2025-08-09).';
      const ents = await extractEntities(text);
      await db.table('documents').add({ id, name, type: 'manual', rev: 1, createdAt: Date.now(), updatedAt: Date.now(), tags: ents.map(e=>e.value) });
      setStatus('Ingested 1 document');
      await refresh();
    }catch(e:any){ setStatus(e?.message||String(e)); }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Document Control</Typography>
        <Box display="flex" gap={1}>
          <Button variant="contained" onClick={() => void ingestMock()}>Ingest Mock</Button>
          <Button variant="outlined" onClick={() => void refresh()}>Refresh</Button>
        </Box>
      </Box>
      <Card>
        <CardContent>
          <Typography color="text.secondary" mb={2}>{status || `Total: ${docs.length}`}</Typography>
          <List dense data-testid="docs-list">
            {docs.map(d => (
              <ListItem key={d.id}>
                <ListItemText primary={`${d.name} (rev ${d.rev||1})`} secondary={(d.tags||[]).join(', ')} />
              </ListItem>
            ))}
            {docs.length===0 && <Typography color="text.secondary">No documents</Typography>}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
