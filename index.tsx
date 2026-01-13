
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Yuklanmoqda...</div>}>
      <App />
    </React.Suspense>
  );
}
