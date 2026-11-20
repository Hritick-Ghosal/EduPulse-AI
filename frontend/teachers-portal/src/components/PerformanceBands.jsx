import { BarChart3 } from 'lucide-react';

const BAND_METRICS = {
  'Immediate Support Needed': { color: '#dc2626', bg: '#fee2e2', bar: '#ef4444', scoreRange: '< 40' },
  'Needs Improvement': { color: '#d97706', bg: '#fef3c7', bar: '#f59e0b', scoreRange: '40–59' },
  'Satisfactory': { color: '#2563eb', bg: '#eff6ff', bar: '#3b82f6', scoreRange: '60–79' },
  'Strong Performance': { color: '#059669', bg: '#d1fae5', bar: '#10b981', scoreRange: '80–100' },
};

export default function PerformanceBands({ bands }) {
  const bandsData = bands || {
    'Immediate Support Needed': 0,
    'Needs Improvement': 0,
    'Satisfactory': 0,
    'Strong Performance': 0,
  };

  const totalAssessed = Object.values(bandsData).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="portal-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <BarChart3 size={20} color="#2563eb" />
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
          Performance Distribution Bands
        </h3>
      </div>

      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
        Cohort distribution across standardized support categories based on composite 3-subject assessment.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
        {Object.entries(bandsData).map(([bandName, count]) => {
          const meta = BAND_METRICS[bandName] || {
            color: '#64748b',
            bg: '#f1f5f9',
            bar: '#94a3b8',
            scoreRange: '—',
          };
          const percentage = totalAssessed > 0 ? Math.round((count / totalAssessed) * 100) : 0;

          return (
            <div key={bandName}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: meta.bar,
                      display: 'inline-block',
                    }}
                  />
                  <strong style={{ color: '#1e293b' }}>{bandName}</strong>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>({meta.scoreRange})</span>
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: meta.color }}>{count}</span>
                  <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '4px' }}>
                    ({percentage}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: meta.bar,
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748b',
        }}
      >
        <span>Total Assessed Students:</span>
        <strong>{totalAssessed}</strong>
      </div>
    </div>
  );
}
