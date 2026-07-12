import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
const theme = createTheme({palette:{primary:{main:'#155e75'}, secondary:{main:'#0f766e'}, background:{default:'#f6f8fb'}}, shape:{borderRadius:12}});
createRoot(document.getElementById('root')).render(<React.StrictMode><ThemeProvider theme={theme}><CssBaseline/><BrowserRouter><App/></BrowserRouter></ThemeProvider></React.StrictMode>);
