import { Component, ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; msg?: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(err: any) {
    return { hasError: true, msg: err?.message || 'Unexpected error' };
  }
  componentDidCatch(err: any, info: any) {
    console.error('ErrorBoundary', err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box p={4}>
          <Typography variant="h5" gutterBottom>Something went wrong</Typography>
          <Typography color="text.secondary" paragraph>{this.state.msg}</Typography>
          <Button variant="contained" onClick={() => location.reload()}>Reload</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
