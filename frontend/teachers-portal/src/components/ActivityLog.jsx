import { History, CheckCircle, Info } from 'lucide-react';

export default function ActivityLog({ activities = [] }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="portal-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <History size={20} color="#7c3aed" />
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
          Recent Teacher Activity Audit Log
        </h3>
      </div>

      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
        Real-time audit records of student creations, CSV imports, and ML predictions.
      </p>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '320px' }}>
        {activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: '#1e293b',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <CheckCircle size={14} color="#2563eb" /> {act.action}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {formatDate(act.created_at)}
                  </span>
                </div>
                <div style={{ color: '#475569', fontSize: '12px' }}>
                  {act.details}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
            }}
          >
            <Info size={28} color="#94a3b8" style={{ margin: '0 auto 6px' }} />
            <div style={{ color: '#64748b', fontSize: '13px' }}>No audit actions logged yet.</div>
          </div>
        )}
      </div>
    </div>
  );
}
