import { Users, Calculator, BookOpen, PenTool } from 'lucide-react';

export default function KpiCards({ analytics }) {
  const total = analytics?.total_students ?? 0;
  const mathAvg = analytics?.averages?.math ?? 0;
  const readingAvg = analytics?.averages?.reading ?? 0;
  const writingAvg = analytics?.averages?.writing ?? 0;

  const cards = [
    {
      title: 'Total Registered Students',
      value: total,
      subtext: 'Enrolled in academic tracker',
      color: '#0f172a',
      icon: Users,
      bgIcon: '#f1f5f9',
      iconColor: '#475569',
    },
    {
      title: 'Average Math Score',
      value: `${mathAvg}`,
      subtext: 'Actual & ML Predicted baseline',
      color: '#2563eb',
      icon: Calculator,
      bgIcon: '#eff6ff',
      iconColor: '#2563eb',
    },
    {
      title: 'Average Reading Score',
      value: `${readingAvg}`,
      subtext: 'Standardized assessment marks',
      color: '#059669',
      icon: BookOpen,
      bgIcon: '#f0fdf4',
      iconColor: '#059669',
    },
    {
      title: 'Average Writing Score',
      value: `${writingAvg}`,
      subtext: 'Evaluated course rubric marks',
      color: '#7c3aed',
      icon: PenTool,
      bgIcon: '#f5f3ff',
      iconColor: '#7c3aed',
    },
  ];

  return (
    <div className="grid-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="portal-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{c.title}</div>
                <div style={{ fontSize: '30px', fontWeight: 800, color: c.color, marginTop: '4px' }}>
                  {c.value}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  {c.subtext}
                </div>
              </div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: c.bgIcon,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.iconColor,
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
