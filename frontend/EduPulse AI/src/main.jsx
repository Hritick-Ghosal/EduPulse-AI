import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './index.jsx'
import './assets/styles.css'

// â”€â”€â”€ Service Worker Registration for Offline Capabilities â”€â”€â”€
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('EduPulse PWA Service Worker registered successfully with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)