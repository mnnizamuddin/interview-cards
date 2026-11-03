import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App, type ProgressStore } from './App.tsx';
import { loadProgress, requestPersistentStorage, saveProgress } from './play/storage.ts';
import './styles.css';

const store: ProgressStore = { load: loadProgress, save: saveProgress };

void requestPersistentStorage();

// Only the built app is cached for offline use: in development it would serve stale modules.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App store={store} now={() => new Date()} />
  </StrictMode>,
);
