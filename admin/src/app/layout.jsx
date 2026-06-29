'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../lib/theme';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Green Yatra India — Admin Panel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="alternate icon" type="image/png" sizes="32x32" href="/favicon.ico.png" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
