import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#2F6B3F', light: '#4A9B5E', dark: '#1A4A2A', contrastText: '#fff' },
    secondary: { main: '#795548', contrastText: '#fff' },
    success: { main: '#4CAF50' },
    background: { default: '#F5F0E8', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 800 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0 4px 20px rgba(47,107,63,0.08)', borderRadius: 16 } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, borderRadius: 10 } } },
  },
});

export default theme;
