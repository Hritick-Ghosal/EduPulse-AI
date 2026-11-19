import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import WorkspaceRoot from './index.jsx';
import TeacherPortal from './TeacherPortal.jsx';
import './assets/styles.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  });
}

function RootSwitcher() {
  const [portal, setPortal] = useState('teacher'); // 'teacher' | 'student'

  if (portal === 'teacher') {
    return <TeacherPortal onSwitchToStudent={() => setPortal('student')} />;
  }

  return (
    <>
      <button
        onClick={() => setPortal('teacher')}
        style={{
          position: 'fixed',
          bottom: '18px',
          right: '18px',
          zIndex: 9999,
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '999px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
        }}
      >
        Teacher Portal
      </button>
      <WorkspaceRoot />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootSwitcher />
  </StrictMode>
);