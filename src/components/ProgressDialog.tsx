import { Dialog, DialogTitle, DialogContent, LinearProgress, Typography, Box } from '@mui/material';

export function ProgressDialog({ open, title, progressText }: { open: boolean; title: string; progressText: string; }){
  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} py={1}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary">{progressText}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
