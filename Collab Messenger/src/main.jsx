import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme as createMuiTheme } from '@mui/material/styles';
import App from './App';
import { CssBaseline } from '@mui/material';

// Create a custom MUI theme
const muiTheme = createMuiTheme({
  shadows: [
    'none', // 0
    '0px 1px 2px rgba(0, 0, 0, 0.1)', // 1
    '0px 1px 3px rgba(0, 0, 0, 0.12)', // 2
    '0px 1px 5px rgba(0, 0, 0, 0.2)', // 3
    '0px 2px 4px rgba(0, 0, 0, 0.2)', // 4
    '0px 3px 6px rgba(0, 0, 0, 0.23)', // 5
    // Add more shadows as needed
  ],
  palette: {
    mode: 'dark', // or 'light'
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);