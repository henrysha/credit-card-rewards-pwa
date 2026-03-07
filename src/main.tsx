import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runNotificationChecks } from './notifications';

declare global {
  interface Window {
    runNotificationChecks: typeof runNotificationChecks;
  }
}

window.runNotificationChecks = runNotificationChecks;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
