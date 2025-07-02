
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from '@/hooks/useAuth';
import './index.css';

console.log('🚀 [MAIN] Starting app initialization...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ [MAIN] Root element not found!');
  throw new Error('Failed to find the root element');
}

console.log('✅ [MAIN] Root element found, rendering app...');

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

console.log('🎯 [MAIN] App render initiated');
