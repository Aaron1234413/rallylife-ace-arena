
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import './index.css';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <AppLayout>
        <App />
      </AppLayout>
    </AuthProvider>
  </React.StrictMode>
);
