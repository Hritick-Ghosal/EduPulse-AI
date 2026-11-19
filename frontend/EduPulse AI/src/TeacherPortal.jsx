import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Calculator,
  Upload,
  AlertTriangle,
  BarChart3,
  Plus,
  Trash2,
  LogOut,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/academics';

const PARENTAL_OPTIONS = [
  "some high school",
  "high school",
  "some college",
  "associate's degree",
  "bachelor's degree",
  "master's degree",
];

export default function TeacherPortal({ onSwitchToStudent }) {
  const [token, setToken] = useState(() => localStorage.getItem('teacher_token') || '');
  const [teacherInfo, setTeacherInfo] = useState(() => {
    const saved = localStorage.getItem('teacher_info');
    return saved ? JSON.parse(saved) : null;
  });

  // Login state
  const [username, setUsername] = useState('teacher1');
  const [password, setPassword] = useState('Teacher@123');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Active sub-tab: 'dashboard' | 'predict' | 'students' | 'upload'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Add student form
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    name: '',
    email: '',
    class_name: 'BCA 3rd Year',
    section: 'A',
    gender: 'female',
    race_ethnicity: 'group C',
  });
  const [studentMsg, setStudentMsg] = useState('');

  // ML Prediction form
  const [predForm, setPredForm] = useState({
    student_id: '',
    gender: 'female',
    race_ethnicity: 'group C',
    parental_education: "bachelor's degree",
    lunch: 'standard',
    test_preparation: 'completed',
    reading_score: 78,
    writing_score: 82,
  });
  const [predResult, setPredResult] = useState(null);
  const [predError, setPredError] = useState('');

  // CSV upload state
  const [csvFile, setCsvFile] = useState(null);
  const [csvReport, setCsvReport] = useState(null);
  const [csvError, setCsvError] = useState('');

  const authHeaders = useCallback(
    () => ({
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const handleLogout = useCallback(async () => {
    if (token) {
      try {
        await fetch(`${API_BASE}/teacher/logout/`, {
          method: 'POST',
          headers: { Authorization: `Token ${token}` },
        });
      } catch {
        // Ignore network errors during logout
      }
    }
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('teacher_info');
    setToken('');
    setTeacherInfo(null);
    setAnalytics(null);
    setStudents([]);
  }, [token]);

  const fetchAllData = useCallback(async () => {
    if (!token) return;
    try {
      const [anaRes, stuRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/`, { headers: { Authorization: `Token ${token}` } }),
        fetch(`${API_BASE}/students/`, { headers: { Authorization: `Token ${token}` } }),
      ]);

      if (anaRes.status === 401 || stuRes.status === 401) {
        handleLogout();
        return;
      }

      const anaData = await anaRes.json();
      const stuData = await stuRes.json();
      setAnalytics(anaData);
      setStudents(stuData.students || []);
    } catch (err) {
      console.error('Failed to fetch academic data:', err);
    }
  }, [token, handleLogout]);

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, fetchAllData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/teacher/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Login failed');
      } else {
        localStorage.setItem('teacher_token', data.token);
        localStorage.setItem('teacher_info', JSON.stringify(data.teacher));
        setToken(data.token);
        setTeacherInfo(data.teacher);
      }
    } catch {
      setAuthError('Cannot connect to Django backend at http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setStudentMsg('');
    try {
      const res = await fetch(`${API_BASE}/students/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newStudent),
      });
      const data = await res.json();
      if (!res.ok) {
        setStudentMsg(`Error: ${data.error}`);
      } else {
        setStudentMsg(`Added ${newStudent.name} (${newStudent.student_id})`);
        setNewStudent({
          ...newStudent,
          student_id: '',
          name: '',
          email: '',
        });
        fetchAllData();
      }
    } catch {
      setStudentMsg('Error creating student record.');
    }
  };

  const handleDeleteStudent = async (id, sid) => {
    if (!window.confirm(`Delete student ${sid}?`)) return;
    try {
      await fetch(`${API_BASE}/students/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredError('');
    setPredResult(null);
    try {
      const res = await fetch(`${API_BASE}/predict/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          ...predForm,
          reading_score: Number(predForm.reading_score),
          writing_score: Number(predForm.writing_score),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPredError(data.error || 'Prediction failed');
      } else {
        setPredResult(data);
        if (predForm.student_id) fetchAllData();
      }
    } catch {
      setPredError('Failed to connect to ML prediction endpoint.');
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    setCsvError('');
    setCsvReport(null);
    if (!csvFile) {
      setCsvError('Please choose a .csv file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await fetch(`${API_BASE}/upload-csv/`, {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setCsvError(data.error || 'CSV upload failed');
      } else {
        setCsvReport(data);
        fetchAllData();
      }
    } catch {
      setCsvError('Error uploading CSV file.');
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px',
    },
    container: { maxWidth: '1180px', margin: '0 auto' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      padding: '16px 24px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '20px',
      marginBottom: '20px',
    },
    grid4: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '20px',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '20px',
    },
    btnPrimary: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
    btnSecondary: {
      backgroundColor: '#f1f5f9',
      color: '#1e293b',
      border: '1px solid #cbd5e1',
      padding: '8px 14px',
      borderRadius: '8px',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
    input: {
      width: '100%',
      padding: '9px 12px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '14px',
      boxSizing: 'border-box',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: 600,
      color: '#334155',
      marginBottom: '5px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
    },
    th: {
      textAlign: 'left',
      padding: '10px 12px',
      borderBottom: '2px solid #e2e8f0',
      color: '#475569',
      fontWeight: 600,
    },
    td: {
      padding: '10px 12px',
      borderBottom: '1px solid #f1f5f9',
    },
  };

  // ─── LOGIN VIEW ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div style={styles.page}>
        <div style={{ maxWidth: '420px', margin: '60px auto' }}>
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>EduPulse Teacher Portal</h2>
              {onSwitchToStudent && (
                <button onClick={onSwitchToStudent} style={styles.btnSecondary}>
                  <BookOpen size={15} /> Student App
                </button>
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '18px' }}>
              Sign in to manage student academic records, upload marks CSVs, and run ML performance predictions.
            </p>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Teacher Username</label>
                <input
                  style={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  style={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {authError && (
                <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>
                  {authError}
                </div>
              )}
              <button type="submit" disabled={loading} style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }}>
                {loading ? 'Signing in...' : 'Login as Teacher'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── AUTHENTICATED TEACHER PORTAL ───────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top Bar */}
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px' }}>EduPulse AI — Academic Monitoring & ML Prediction</h1>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Logged in as <strong>{teacherInfo?.name || 'Teacher'}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {onSwitchToStudent && (
              <button onClick={onSwitchToStudent} style={styles.btnSecondary}>
                <BookOpen size={16} /> Student Assistant
              </button>
            )}
            <button onClick={handleLogout} style={styles.btnSecondary}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { id: 'dashboard', label: 'Class Analytics & At-Risk', icon: BarChart3 },
            { id: 'predict', label: 'ML Math Score Predictor', icon: Calculator },
            { id: 'students', label: 'Student Records', icon: Users },
            { id: 'upload', label: 'Bulk CSV Upload', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={active ? styles.btnPrimary : styles.btnSecondary}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ANALYTICS & AT-RISK STUDENTS */}
        {activeTab === 'dashboard' && (
          <>
            <div style={styles.grid4}>
              <div style={styles.card}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Total Registered Students</div>
                <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '6px' }}>
                  {analytics?.total_students ?? 0}
                </div>
              </div>
              <div style={styles.card}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Average Math Score</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>
                  {analytics?.averages?.math ?? 0}
                </div>
              </div>
              <div style={styles.card}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Average Reading Score</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#059669', marginTop: '6px' }}>
                  {analytics?.averages?.reading ?? 0}
                </div>
              </div>
              <div style={styles.card}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Average Writing Score</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#7c3aed', marginTop: '6px' }}>
                  {analytics?.averages?.writing ?? 0}
                </div>
              </div>
            </div>

            <div style={styles.grid2}>
              {/* Performance Bands */}
              <div style={styles.card}>
                <h3 style={{ marginTop: 0, fontSize: '16px' }}>Performance Distribution Bands</h3>
                {analytics?.performance_bands &&
                  Object.entries(analytics.performance_bands).map(([band, count]) => (
                    <div
                      key={band}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <span>{band}</span>
                      <strong>{count} students</strong>
                    </div>
                  ))}
              </div>

              {/* Recent Teacher Audit Activity */}
              <div style={styles.card}>
                <h3 style={{ marginTop: 0, fontSize: '16px' }}>Recent Teacher Activity Log</h3>
                {analytics?.recent_activities?.length ? (
                  analytics.recent_activities.map((act) => (
                    <div
                      key={act.id}
                      style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}
                    >
                      <strong>{act.action}:</strong> {act.details}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#64748b', fontSize: '14px' }}>No activity logged yet.</p>
                )}
              </div>
            </div>

            {/* At-Risk Review List */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle size={18} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  At-Risk / Support-Needed Student Review List (Average &lt; 60)
                </h3>
              </div>
              {analytics?.at_risk_students?.length ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Roll / ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Class</th>
                        <th style={styles.th}>Reading</th>
                        <th style={styles.th}>Writing</th>
                        <th style={styles.th}>Actual / Pred Math</th>
                        <th style={styles.th}>Avg</th>
                        <th style={styles.th}>Support Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.at_risk_students.map((st) => (
                        <tr key={st.id}>
                          <td style={styles.td}>{st.student_id}</td>
                          <td style={styles.td}>{st.name}</td>
                          <td style={styles.td}>{st.class_name}</td>
                          <td style={styles.td}>{st.reading_score}</td>
                          <td style={styles.td}>{st.writing_score}</td>
                          <td style={styles.td}>
                            {st.math_score ?? '—'} / <strong>{st.predicted_math_score ?? '—'}</strong>
                          </td>
                          <td style={styles.td}>
                            <strong>{st.average_score}</strong>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                              }}
                            >
                              {st.support_category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  No students currently below the 60-mark support threshold. Upload a CSV or run predictions to populate.
                </p>
              )}
            </div>
          </>
        )}

        {/* TAB 2: ML MATH SCORE PREDICTOR */}
        {activeTab === 'predict' && (
          <div style={styles.grid2}>
            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>Predict Student Mathematics Score</h3>
              <form onSubmit={handlePredict}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Link to Existing Student ID (Optional)</label>
                  <select
                    style={styles.input}
                    value={predForm.student_id}
                    onChange={(e) => setPredForm({ ...predForm, student_id: e.target.value })}
                  >
                    <option value="">-- Standalone Simulation (Do not attach) --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.student_id}>
                        {s.student_id} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.grid2}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={styles.label}>Gender</label>
                    <select
                      style={styles.input}
                      value={predForm.gender}
                      onChange={(e) => setPredForm({ ...predForm, gender: e.target.value })}
                    >
                      <option value="female">female</option>
                      <option value="male">male</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={styles.label}>Race / Ethnicity Group</label>
                    <select
                      style={styles.input}
                      value={predForm.race_ethnicity}
                      onChange={(e) => setPredForm({ ...predForm, race_ethnicity: e.target.value })}
                    >
                      {['group A', 'group B', 'group C', 'group D', 'group E'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Parental Level of Education</label>
                  <select
                    style={styles.input}
                    value={predForm.parental_education}
                    onChange={(e) => setPredForm({ ...predForm, parental_education: e.target.value })}
                  >
                    {PARENTAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.grid2}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={styles.label}>Lunch Type</label>
                    <select
                      style={styles.input}
                      value={predForm.lunch}
                      onChange={(e) => setPredForm({ ...predForm, lunch: e.target.value })}
                    >
                      <option value="standard">standard</option>
                      <option value="free/reduced">free/reduced</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={styles.label}>Test Preparation Course</label>
                    <select
                      style={styles.input}
                      value={predForm.test_preparation}
                      onChange={(e) => setPredForm({ ...predForm, test_preparation: e.target.value })}
                    >
                      <option value="completed">completed</option>
                      <option value="none">none</option>
                    </select>
                  </div>
                </div>

                <div style={styles.grid2}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Reading Score (0–100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      style={styles.input}
                      value={predForm.reading_score}
                      onChange={(e) => setPredForm({ ...predForm, reading_score: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={styles.label}>Writing Score (0–100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      style={styles.input}
                      value={predForm.writing_score}
                      onChange={(e) => setPredForm({ ...predForm, writing_score: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {predError && <div style={{ color: '#dc2626', marginBottom: '10px' }}>{predError}</div>}
                <button type="submit" style={styles.btnPrimary}>
                  <Calculator size={16} /> Run Linear Regression Prediction
                </button>
              </form>
            </div>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>Prediction Output</h3>
              {predResult ? (
                <div>
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      padding: '18px',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ fontSize: '13px', color: '#1e40af' }}>Predicted Mathematics Score</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#1d4ed8' }}>
                      {predResult.predicted_math_score} / 100
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '14px' }}>
                      Estimated 3-Subject Average: <strong>{predResult.estimated_average}</strong>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '14px' }}>
                      Classification: <strong>{predResult.support_category}</strong>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#fefce8',
                      border: '1px solid #fde047',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px',
                      color: '#854d0e',
                    }}
                  >
                    <strong>Academic Ethics Note:</strong> {predResult.disclaimer}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  Fill in the student attributes and Reading/Writing scores to compute an estimated Mathematics score using the trained Scikit-Learn pipeline.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT RECORD MANAGEMENT */}
        {activeTab === 'students' && (
          <div style={styles.grid2}>
            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>Register New Student</h3>
              <form onSubmit={handleAddStudent}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={styles.label}>Student Roll / ID *</label>
                  <input
                    style={styles.input}
                    placeholder="e.g., BCA2026-101"
                    value={newStudent.student_id}
                    onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                    required
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    style={styles.input}
                    placeholder="e.g., Ananya Roy"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.grid2}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={styles.label}>Class *</label>
                    <input
                      style={styles.input}
                      value={newStudent.class_name}
                      onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={styles.label}>Section</label>
                    <input
                      style={styles.input}
                      value={newStudent.section}
                      onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    />
                  </div>
                </div>
                <div style={styles.grid2}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={styles.label}>Gender</label>
                    <select
                      style={styles.input}
                      value={newStudent.gender}
                      onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    >
                      <option value="female">female</option>
                      <option value="male">male</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={styles.label}>Group</label>
                    <select
                      style={styles.input}
                      value={newStudent.race_ethnicity}
                      onChange={(e) => setNewStudent({ ...newStudent, race_ethnicity: e.target.value })}
                    >
                      {['group A', 'group B', 'group C', 'group D', 'group E'].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {studentMsg && (
                  <div style={{ fontSize: '13px', marginBottom: '10px', color: '#1d4ed8' }}>{studentMsg}</div>
                )}
                <button type="submit" style={styles.btnPrimary}>
                  <Plus size={16} /> Add Student
                </button>
              </form>
            </div>

            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>Enrolled Students ({filteredStudents.length})</h3>
                <input
                  style={{ ...styles.input, maxWidth: '210px' }}
                  placeholder="Search ID, name, class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Class</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((st) => (
                      <tr key={st.id}>
                        <td style={styles.td}>{st.student_id}</td>
                        <td style={styles.td}>{st.name}</td>
                        <td style={styles.td}>
                          {st.class_name} {st.section && `(${st.section})`}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleDeleteStudent(st.id, st.student_id)}
                            style={{ ...styles.btnSecondary, color: '#dc2626', padding: '5px 8px' }}
                            title="Delete student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BULK CSV UPLOAD */}
        {activeTab === 'upload' && (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>Bulk Student Marks CSV Upload & Batch Prediction</h3>
            <p style={{ fontSize: '14px', color: '#475569' }}>
              Upload a CSV file with required columns: <code>student_id, name, class_name, reading_score, writing_score</code>{' '}
              (optional columns: <code>math_score, section, gender, race_ethnicity, parental_education, lunch, test_preparation</code>).
              Each valid row is validated, stored in the relational database, and scored by the ML model automatically.
            </p>
            <form onSubmit={handleCsvUpload} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '14px' }}>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <button type="submit" style={styles.btnPrimary}>
                <Upload size={16} /> Upload & Process CSV
              </button>
            </form>

            {csvError && <div style={{ color: '#dc2626', marginTop: '12px' }}>{csvError}</div>}

            {csvReport && (
              <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 600 }}>
                  <CheckCircle2 size={18} /> {csvReport.message}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                  Created: <strong>{csvReport.created}</strong> | Updated: <strong>{csvReport.updated}</strong> | Row Errors: <strong>{csvReport.errors?.length || 0}</strong>
                </p>
                {csvReport.errors?.length > 0 && (
                  <ul style={{ color: '#b91c1c', fontSize: '13px', marginTop: '8px' }}>
                    {csvReport.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}