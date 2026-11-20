import { useState } from 'react';
import { GraduationCap, LogIn, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('teacher1');
  const [password, setPassword] = useState('Teacher@123');
  const [authError, setAuthError] = useState('');

  const studentAppUrl = import.meta.env.VITE_STUDENT_APP_URL || 'http://localhost:5173';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await login(username, password);
    } catch (err) {
      if (err.data?.error) {
        setAuthError(err.data.error);
      } else if (err.status === 401) {
        setAuthError('Invalid teacher credentials. Please check your username and password.');
      } else {
        setAuthError('Unable to connect to Django API backend at http://localhost:8000. Ensure the backend server is running.');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: '24px 16px',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              backgroundColor: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
              marginBottom: '14px',
            }}
          >
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            EduPulse AI
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Teacher Academic Monitoring & ML Analytics Portal
          </p>
        </div>

        <div className="portal-card" style={{ padding: '28px 24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Teacher Sign In</h2>
            <a
              href={studentAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 10px', textDecoration: 'none' }}
              title="Open Student Assistant"
            >
              <ExternalLink size={13} /> Student App
            </a>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Teacher Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. teacher1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {authError && (
              <div className="alert-box alert-error">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              <LogIn size={18} /> {loading ? 'Signing In...' : 'Sign In as Faculty'}
            </button>
          </form>

          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #dbeafe',
              fontSize: '12px',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Quick Test Credentials:</strong>
              <div style={{ fontFamily: 'monospace', marginTop: '2px' }}>
                Username: <strong>teacher1</strong> | Password: <strong>Teacher@123</strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '16px' }}>
          EduPulse AI Platform • Decoupled Microservice Architecture
        </div>
      </div>
    </div>
  );
}
