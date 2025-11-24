import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import App from './App';
import { CssBaseline } from '@mui/material';
import { ThemeContextProvider } from './store/theme.context';

// Create a custom MUI theme
const muiTheme = createMuiTheme({
  shadows: [
    'none', // 0
    '0px 1px 2px rgba(0, 0, 0, 0.1)', // 1
    '0px 1px 3px rgba(0, 0, 0, 0.12)', // 2
    '0px 1px 5px rgba(0, 0, 0, 0.2)', // 3
    '0px 2px 4px rgba(0, 0, 0, 0.2)', // 4
    '0px 3px 6px rgba(0, 0, 0, 0.23)', // 5
    '0px 5px 10px rgba(0, 0, 0, 0.25)', // 6
    '0px 7px 12px rgba(0, 0, 0, 0.27)', // 7
    '0px 9px 14px rgba(0, 0, 0, 0.30)', // 8
    '0px 11px 16px rgba(0, 0, 0, 0.33)', // 9
  ],
  
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeContextProvider>
  </React.StrictMode>
);