import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registro do Service Worker do PWA para suporte à instalação no celular
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('📱 [PWA] Service Worker ativo:', reg.scope))
      .catch((err) => console.info('ℹ️ [PWA] Service worker:', err?.message || 'offline'));
  });
}
