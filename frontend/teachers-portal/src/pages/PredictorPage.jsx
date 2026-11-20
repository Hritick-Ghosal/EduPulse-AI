import { useState } from 'react';
import { Calculator, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import EthicsBanner from '../components/EthicsBanner';

const PARENTAL_OPTIONS = [
  'some high school',
  'high school',
  'some college',
  "associate's degree",
  "bachelor's degree",
  "master's degree",
];

const ETHNICITY_OPTIONS = ['group A', 'group B', 'group C', 'group D', 'group E'];

export default function PredictorPage({ students = [], onPredictionSaved }) {
  const [form, setForm] = useState({
    student_id: '',
    gender: 'female',
    race_ethnicity: 'group C',
    parental_education: "bachelor's degree",
    lunch: 'standard',
    test_preparation: 'completed',
    reading_score: 78,
    writing_score: 82,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentSelect = (e) => {
    const selectedSid = e.target.value;
    const selectedStudent = students.find((s) => s.student_id === selectedSid);

    if (selectedStudent) {
      setForm((prev) => ({
        ...prev,
        student_id: selectedSid,
        gender: selectedStudent.gender || prev.gender,
        race_ethnicity: selectedStudent.race_ethnicity || prev.race_ethnicity,
        parental_education: selectedStudent.parental_education || prev.parental_education,
        lunch: selectedStudent.lunch || prev.lunch,
        test_preparation: selectedStudent.test_preparation || prev.test_preparation,
      }));
    } else {
      setForm((prev) => ({ ...prev, student_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        ...form,
        reading_score: Number(form.reading_score),
        writing_score: Number(form.writing_score),
      };

      const data = await api.predictMathScore(payload);
      setResult(data);

      if (form.student_id && onPredictionSaved) {
        onPredictionSaved();
      }
    } catch (err) {
      setError(err.data?.error || err.message || 'Failed to compute ML prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={22} color="#2563eb" /> ML Mathematics Score Predictor
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
          Interactive regression simulator driven by the trained Scikit-Learn pipeline to forecast math achievement and classify student support tiers.
        </p>
      </div>

      <EthicsBanner />

      <div className="grid-2">
        {/* Form Card */}
        <div className="portal-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>
            Input Student Attributes & Assessment Scores
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Link to Enrolled Student (Optional)</label>
              <select
                name="student_id"
                className="form-select"
                value={form.student_id}
                onChange={handleStudentSelect}
              >
                <option value="">-- Standalone Simulation (Do not save to student) --</option>
                {students.map((st) => (
                  <option key={st.id || st.student_id} value={st.student_id}>
                    {st.student_id} — {st.name} ({st.class_name})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                Selecting a student auto-saves the prediction into their academic profile.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="female">female</option>
                  <option value="male">male</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Race / Ethnicity Group</label>
                <select
                  name="race_ethnicity"
                  className="form-select"
                  value={form.race_ethnicity}
                  onChange={handleChange}
                >
                  {ETHNICITY_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Parental Level of Education</label>
              <select
                name="parental_education"
                className="form-select"
                value={form.parental_education}
                onChange={handleChange}
              >
                {PARENTAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Lunch Type</label>
                <select
                  name="lunch"
                  className="form-select"
                  value={form.lunch}
                  onChange={handleChange}
                >
                  <option value="standard">standard</option>
                  <option value="free/reduced">free/reduced</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Test Preparation</label>
                <select
                  name="test_preparation"
                  className="form-select"
                  value={form.test_preparation}
                  onChange={handleChange}
                >
                  <option value="completed">completed</option>
                  <option value="none">none</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Reading Score (0–100) *</label>
                <input
                  type="number"
                  name="reading_score"
                  min="0"
                  max="100"
                  className="form-input"
                  value={form.reading_score}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Writing Score (0–100) *</label>
                <input
                  type="number"
                  name="writing_score"
                  min="0"
                  max="100"
                  className="form-input"
                  value={form.writing_score}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="alert-box alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '4px' }}
            >
              <Calculator size={16} />
              {loading ? 'Running ML Inference...' : 'Run Linear Regression Prediction'}
            </button>
          </form>
        </div>

        {/* Prediction Results Card */}
        <div className="portal-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>
            Model Inference Output &amp; Diagnostics
          </h3>

          {result ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Predicted Mathematics Score
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 800, color: '#1d4ed8', margin: '8px 0' }}>
                    {result.predicted_math_score}
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#60a5fa' }}> / 100</span>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1e293b',
                    }}
                  >
                    <span>Classification:</span>
                    <span
                      style={{
                        color:
                          result.support_category === 'Immediate Support Needed'
                            ? '#dc2626'
                            : result.support_category === 'Needs Improvement'
                            ? '#d97706'
                            : '#059669',
                      }}
                    >
                      {result.support_category}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Estimated 3-Subj Average</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      {result.estimated_average}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Record Link Status</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#059669', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {form.student_id ? (
                        <>
                          <CheckCircle2 size={15} /> Saved to {form.student_id}
                        </>
                      ) : (
                        <span style={{ color: '#64748b' }}>Simulated (Unsaved)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {result.disclaimer && (
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef08a',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#854d0e',
                  }}
                >
                  <strong>Model Compliance Note:</strong> {result.disclaimer}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <Sparkles size={38} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>
                Awaiting Feature Input
              </div>
              <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '320px', marginTop: '6px' }}>
                Adjust the demographic parameters and scores in the form and click Run Prediction to trigger the Scikit-Learn regression engine.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
