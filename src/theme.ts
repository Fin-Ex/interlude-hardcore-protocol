import { createTheme } from '@mui/material/styles';

export const MONO = '"Roboto Mono", ui-monospace, Consolas, monospace';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3949ab' },
    secondary: { main: '#00796b' },
    background: { default: '#fafafa', paper: '#ffffff' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none' },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTab: { styleOverrides: { root: { minHeight: 64 } } },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({ fontWeight: 500, color: theme.palette.text.secondary }),
      },
    },
  },
});
