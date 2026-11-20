import { LogOut, GraduationCap, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { teacher, logout } = useAuth();
  const studentAppUrl = import.meta.env.VITE_STUDENT_APP_URL || 'http://localhost:5173';

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>
                EduPulse AI
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid #bfdbfe',
                }}
              >
                Teacher Portal
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={13} color="#059669" />
              <span>
                Logged in as <strong>{teacher?.name || teacher?.username || 'Teacher'}</strong>
                {teacher?.subject_specialization ? ` (${teacher.subject_specialization})` : ''}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={studentAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            title="Open Student AI Study Assistant"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={15} /> Student App
          </a>
          <button onClick={logout} className="btn btn-secondary" title="Sign out of Teacher Portal">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
