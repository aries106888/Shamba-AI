import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d2a1a',
              color: '#e2f5d4',
              border: '1px solid #1e4d2b',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#A8D65C', secondary: '#06150F' } },
            error:   { iconTheme: { primary: '#D9534F', secondary: '#06150F' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
