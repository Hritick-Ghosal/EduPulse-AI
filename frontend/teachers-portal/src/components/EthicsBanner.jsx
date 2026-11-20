import { ShieldAlert } from 'lucide-react';

export default function EthicsBanner({ customText }) {
  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '16px',
      }}
    >
      <ShieldAlert size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.45 }}>
        <strong>Academic Ethics & Responsible AI Notice:</strong>{' '}
        {customText ||
          'All predicted performance metrics are statistical estimations produced by a Scikit-Learn Linear Regression model for early academic advisory and support purposes only. Machine learning outputs must never be used as the sole determinant for formal grading, placement, or disciplinary actions.'}
      </div>
    </div>
  );
}
