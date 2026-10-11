import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export function Message({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Box sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
        {title}
      </Typography>
      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Box>
  );
}

export function Loading() {
  return (
    <Box sx={{ py: 10, textAlign: 'center' }}>
      <CircularProgress size={28} />
    </Box>
  );
}
