import React, { useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import { ThemeContextProvider, ThemeContext } from './context/ThemeContext';

function Root() {
  const { mode } = useContext(ThemeContext);

  const theme = React.useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'light' ? '#4f46e5' : '#6366f1', // Indigo
          contrastText: '#ffffff',
        },
        secondary: {
          main: mode === 'light' ? '#0f766e' : '#0d9488', // Teal
        },
        background: {
          default: mode === 'light' ? '#f8fafc' : '#090d16', // Slate light / dark
          paper: mode === 'light' ? '#ffffff' : '#131a27', // Card light / dark
        },
        text: {
          primary: mode === 'light' ? '#0f172a' : '#f1f5f9',
          secondary: mode === 'light' ? '#475569' : '#94a3b8',
        },
        success: {
          main: mode === 'light' ? '#10b981' : '#34d399', // Emerald
        },
        error: {
          main: mode === 'light' ? '#f43f5e' : '#fb7185', // Rose
        },
        warning: {
          main: mode === 'light' ? '#f59e0b' : '#fbbf24', // Amber
        },
        divider: mode === 'light' ? '#e2e8f0' : '#1e293b',
      },
      typography: {
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        h1: { fontFamily: "'Outfit', 'Segoe UI', sans-serif", fontWeight: 700 },
        h2: { fontFamily: "'Outfit', 'Segoe UI', sans-serif", fontWeight: 700 },
        h3: { fontFamily: "'Outfit', 'Segoe UI', sans-serif", fontWeight: 700 },
        h4: { fontFamily: "'Outfit', 'Segoe UI', sans-serif", fontWeight: 600 },
        h5: { fontFamily: "'Outfit', 'Segoe UI', sans-serif", fontWeight: 600 },
        h6: { fontFamily: "'Outfit', 'Segoe UI', sans-serif", fontWeight: 600 },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 500 },
        body1: { fontSize: '0.925rem', lineHeight: 1.5 },
        body2: { fontSize: '0.825rem', lineHeight: 1.43 },
        button: { textTransform: 'none', fontWeight: 600, fontFamily: "'Outfit', sans-serif" },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '6px 16px',
              transition: 'all 0.2s ease-in-out',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: mode === 'light' 
                ? '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.02)' 
                : '0 4px 20px 0 rgba(0, 0, 0, 0.25)',
              backgroundImage: 'none',
              border: `1px solid ${mode === 'light' ? '#f1f5f9' : '#1e293b'}`,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiTextField: {
          defaultProps: {
            variant: 'outlined',
            size: 'small',
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <Root />
    </ThemeContextProvider>
  </React.StrictMode>
);
