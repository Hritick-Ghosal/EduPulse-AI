import { AlertTriangle, UserCheck } from 'lucide-react';

export default function AtRiskTable({ students = [] }) {
  return (
    <div className="portal-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
            }}
          >
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              At-Risk / Academic Support Review List (Average &lt; 60)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Identifies students requiring academic intervention or additional tutoring
            </span>
          </div>
        </div>

        <span
          className={`badge ${students.length > 0 ? 'badge-danger' : 'badge-success'}`}
          style={{ fontSize: '13px', padding: '5px 10px' }}
        >
          {students.length} student{students.length === 1 ? '' : 's'} flagged
        </span>
      </div>

      {students.length > 0 ? (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll / Student ID</th>
                <th>Full Name</th>
                <th>Class & Section</th>
                <th>Reading</th>
                <th>Writing</th>
                <th>Actual / Pred Math</th>
                <th>3-Subj Avg</th>
                <th>Intervention Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id || st.student_id}>
                  <td>
                    <strong>{st.student_id}</strong>
                  </td>
                  <td>{st.name}</td>
                  <td>
                    {st.class_name} {st.section ? `(${st.section})` : ''}
                  </td>
                  <td>{st.reading_score ?? '—'}</td>
                  <td>{st.writing_score ?? '—'}</td>
                  <td>
                    {st.math_score !== null && st.math_score !== undefined ? (
                      st.math_score
                    ) : (
                      <span style={{ color: '#2563eb', fontWeight: 600 }}>
                        {st.predicted_math_score ?? '—'}*
                      </span>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: st.average_score < 40 ? '#dc2626' : '#d97706' }}>
                      {st.average_score}
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        st.support_category === 'Immediate Support Needed'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {st.support_category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8' }}>
            * Indicates predicted score computed via Scikit-Learn Regression Pipeline.
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px dashed #cbd5e1',
          }}
        >
          <UserCheck size={36} color="#059669" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>
            No Students Currently At Risk
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
            All evaluated students are maintaining an average of 60 or above. Upload a CSV or run new predictions to track additional students.
          </p>
        </div>
      )}
    </div>
  );
}
