/**
 * EduPulse AI — Pure SVG Chart Components
 * No external charting libraries. All charts built with inline SVG elements.
 */

// ─── SimplePieChart ──────────────────────────────────────────────────────────
export function SimplePieChart({ data = [], size = 200 }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  if (total === 0) {
    return (
      <div className="chart-container">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="#f1f5f9"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize="13"
            fontWeight="600"
          >
            No data
          </text>
        </svg>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;

  const slices = data
    .filter((d) => d.value > 0)
    .reduce(
      (acc, d) => {
        const angle = (d.value / total) * 2 * Math.PI;
        const startAngle = acc.currentAngle;
        const endAngle = acc.currentAngle + angle;

        const x1 = cx + radius * Math.cos(startAngle);
        const y1 = cy + radius * Math.sin(startAngle);
        const x2 = cx + radius * Math.cos(endAngle);
        const y2 = cy + radius * Math.sin(endAngle);
        const largeArc = angle > Math.PI ? 1 : 0;

        const pathD = [
          `M ${cx} ${cy}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');

        acc.items.push({ ...d, pathD });
        acc.currentAngle = endAngle;
        return acc;
      },
      { items: [], currentAngle: -Math.PI / 2 }
    ).items;

  return (
    <div className="chart-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i} d={s.pathD} fill={s.color} stroke="#fff" strokeWidth="2" />
        ))}
      </svg>
      <div className="chart-legend">
        {data.map((d, i) => (
          <div key={i} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ backgroundColor: d.color }} />
            <span>{d.label}</span>
            <span style={{ fontWeight: 700 }}>{d.value}</span>
            <span style={{ color: '#94a3b8' }}>
              ({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SimpleBarChart ──────────────────────────────────────────────────────────
export function SimpleBarChart({ data = [], height = 200 }) {
  if (!data.length) {
    return (
      <div className="chart-container">
        <div style={{ padding: '24px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value || 0), 1);
  const barHeight = 28;
  const gap = 10;
  const labelWidth = 80;
  const valueWidth = 50;
  const chartWidth = 320;
  const totalHeight = data.length * (barHeight + gap) - gap + 16;

  return (
    <div className="chart-container">
      <svg
        width="100%"
        height={Math.max(totalHeight, height)}
        viewBox={`0 0 ${labelWidth + chartWidth + valueWidth + 20} ${totalHeight}`}
        style={{ maxWidth: '480px' }}
      >
        {data.map((d, i) => {
          const y = i * (barHeight + gap);
          const barW = Math.max(((d.value || 0) / maxValue) * chartWidth, 4);
          return (
            <g key={i}>
              <text
                x={labelWidth - 8}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="600"
                fill="#475569"
              >
                {d.label}
              </text>
              <rect
                x={labelWidth}
                y={y + 2}
                width={barW}
                height={barHeight - 4}
                rx="4"
                fill={d.color || '#3b82f6'}
              />
              <text
                x={labelWidth + barW + 8}
                y={y + barHeight / 2}
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="700"
                fill="#1e293b"
              >
                {typeof d.value === 'number' ? d.value.toFixed(1) : d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── SimpleDonutChart ────────────────────────────────────────────────────────
export function SimpleDonutChart({ data = [], size = 180, thickness = 35 }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  if (total === 0) {
    return (
      <div className="chart-container">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - thickness / 2 - 4}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
          />
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94a3b8"
            fontSize="13"
            fontWeight="600"
          >
            No data
          </text>
        </svg>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR - thickness;

  const arcs = data
    .filter((d) => d.value > 0)
    .reduce(
      (acc, d) => {
        const angle = (d.value / total) * 2 * Math.PI;
        const startAngle = acc.currentAngle;
        const endAngle = acc.currentAngle + angle;

        const outerX1 = cx + outerR * Math.cos(startAngle);
        const outerY1 = cy + outerR * Math.sin(startAngle);
        const outerX2 = cx + outerR * Math.cos(endAngle);
        const outerY2 = cy + outerR * Math.sin(endAngle);

        const innerX1 = cx + innerR * Math.cos(endAngle);
        const innerY1 = cy + innerR * Math.sin(endAngle);
        const innerX2 = cx + innerR * Math.cos(startAngle);
        const innerY2 = cy + innerR * Math.sin(startAngle);

        const largeArc = angle > Math.PI ? 1 : 0;

        const pathD = [
          `M ${outerX1} ${outerY1}`,
          `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerX2} ${outerY2}`,
          `L ${innerX1} ${innerY1}`,
          `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerX2} ${innerY2}`,
          'Z',
        ].join(' ');

        acc.items.push({ ...d, pathD });
        acc.currentAngle = endAngle;
        return acc;
      },
      { items: [], currentAngle: -Math.PI / 2 }
    ).items;

  return (
    <div className="chart-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((a, i) => (
          <path key={i} d={a.pathD} fill={a.color} stroke="#fff" strokeWidth="2" />
        ))}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="800"
          fill="#0f172a"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="#64748b"
        >
          total
        </text>
      </svg>
      <div className="chart-legend">
        {data.map((d, i) => (
          <div key={i} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ backgroundColor: d.color }} />
            <span>{d.label}</span>
            <span style={{ fontWeight: 700 }}>{d.value}</span>
            <span style={{ color: '#94a3b8' }}>
              ({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
