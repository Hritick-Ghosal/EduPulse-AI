import { useState, useMemo } from 'react';
import { Users, UserPlus, Trash2, Search, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api/client';

const PARENTAL_OPTIONS = [
  'some high school',
  'high school',
  'some college',
  "associate's degree",
  "bachelor's degree",
  "master's degree",
];

const ETHNICITY_OPTIONS = ['group A', 'group B', 'group C', 'group D', 'group E'];

export default function StudentsPage({ students = [], allStudents = [], onRefresh }) {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [newStudent, setNewStudent] = useState({
    student_id: '',
    name: '',
    email: '',
    class_name: 'BCA 3rd Year',
    section: 'A',
    gender: 'female',
    race_ethnicity: 'group C',
    parental_education: "bachelor's degree",
    lunch: 'standard',
    test_preparation: 'none',
  });

  // Combine raw students with rich analytics data if present
  const mergedStudents = useMemo(() => {
    const richMap = new Map();
    allStudents.forEach((st) => {
      richMap.set(st.student_id, st);
    });

    return students.map((s) => {
      const rich = richMap.get(s.student_id);
      return {
        ...s,
        reading_score: rich?.reading_score ?? null,
        writing_score: rich?.writing_score ?? null,
        math_score: rich?.math_score ?? null,
        predicted_math_score: rich?.predicted_math_score ?? null,
        average_score: rich?.average_score ?? 0,
        support_category: rich?.support_category || 'Unassessed',
        upgrade: rich?.upgrade,
      };
    });
  }, [students, allStudents]);

  const classOptions = useMemo(() => {
    const set = new Set();
    mergedStudents.forEach((s) => {
      if (s.class_name) set.add(s.class_name);
    });
    return Array.from(set).sort();
  }, [mergedStudents]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const created = await api.createStudent(newStudent);
      setSuccessMsg(`Student "${created.name || newStudent.name}" (${created.student_id || newStudent.student_id}) registered successfully.`);
      setNewStudent({
        student_id: '',
        name: '',
        email: '',
        class_name: 'BCA 3rd Year',
        section: 'A',
        gender: 'female',
        race_ethnicity: 'group C',
        parental_education: "bachelor's degree",
        lunch: 'standard',
        test_preparation: 'none',
      });
      setShowAddForm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.data?.error || err.message || 'Error registering student record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student ${studentName} (${studentId})? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteStudent(id);
      setSuccessMsg(`Student ${studentId} deleted.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      setErrorMsg(err.data?.error || err.message || 'Failed to delete student');
    }
  };

  const filtered = useMemo(() => {
    return mergedStudents.filter((s) => {
      const query = search.toLowerCase();
      const matchSearch =
        !query ||
        (s.name || '').toLowerCase().includes(query) ||
        (s.student_id || '').toLowerCase().includes(query) ||
        (s.class_name || '').toLowerCase().includes(query) ||
        (s.email || '').toLowerCase().includes(query);

      const matchClass = selectedClass === 'all' || s.class_name === selectedClass;
      const matchTier = selectedTier === 'all' || s.support_category === selectedTier;

      return matchSearch && matchClass && matchTier;
    });
  }, [mergedStudents, search, selectedClass, selectedTier]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} color="#2563eb" /> Student Record Administration &amp; Academic Profiles
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Inspect demographics, individual subject scores, computed support categories, and manage enrolled roster entries.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ fontSize: '13px' }}
        >
          <UserPlus size={15} />
          {showAddForm ? 'Hide Registration Form' : 'Register New Student'}
          {showAddForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {successMsg && (
        <div className="alert-box alert-success">
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Collapsible Register New Student Form */}
      {showAddForm && (
        <div className="portal-card" style={{ marginBottom: '24px', border: '1px solid #bfdbfe', backgroundColor: '#f8faff' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={18} color="#2563eb" /> Register New Student
          </h3>

          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Student Roll / ID *</label>
                <input
                  type="text"
                  name="student_id"
                  className="form-input"
                  placeholder="e.g. BCA2026-101"
                  value={newStudent.student_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Ananya Roy"
                  value={newStudent.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="student@institution.edu"
                  value={newStudent.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class Name *</label>
                <input
                  type="text"
                  name="class_name"
                  className="form-input"
                  placeholder="e.g. BCA 3rd Year"
                  value={newStudent.class_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <input
                  type="text"
                  name="section"
                  className="form-input"
                  placeholder="e.g. A"
                  value={newStudent.section}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={newStudent.gender}
                  onChange={handleChange}
                >
                  <option value="female">female</option>
                  <option value="male">male</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Race / Ethnicity</label>
                <select
                  name="race_ethnicity"
                  className="form-select"
                  value={newStudent.race_ethnicity}
                  onChange={handleChange}
                >
                  {ETHNICITY_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Parental Education</label>
                <select
                  name="parental_education"
                  className="form-select"
                  value={newStudent.parental_education}
                  onChange={handleChange}
                >
                  {PARENTAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                <UserPlus size={16} />
                {loading ? 'Creating Student...' : 'Save Student Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student List & Search Card */}
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
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              Enrolled Student Directory
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Real-time database records with scores and tier status
            </span>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar" style={{ marginBottom: 0, padding: '8px 12px' }}>
            <div style={{ position: 'relative', width: '200px' }}>
              <Search
                size={14}
                color="#94a3b8"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search roster..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '32px', height: '34px' }}
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{ height: '34px' }}
            >
              <option value="all">All Classes</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              style={{ height: '34px' }}
            >
              <option value="all">All Tiers</option>
              <option value="Immediate Support Needed">Immediate Support Needed (&lt;40)</option>
              <option value="Needs Improvement">Needs Improvement (40–59)</option>
              <option value="Satisfactory">Satisfactory (60–79)</option>
              <option value="Strong Performance">Strong Performance (80–100)</option>
            </select>

            <span className="filter-count">
              {filtered.length} of {mergedStudents.length}
            </span>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {filtered.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll / ID</th>
                  <th>Student Name</th>
                  <th>Class &amp; Section</th>
                  <th>Gender</th>
                  <th>Reading</th>
                  <th>Writing</th>
                  <th>Math (Act/Pred)</th>
                  <th>Average</th>
                  <th>Tier Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((st) => (
                  <tr key={st.id || st.student_id}>
                    <td>
                      <strong>{st.student_id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{st.name}</div>
                      {st.email && (
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{st.email}</div>
                      )}
                    </td>
                    <td>
                      {st.class_name} {st.section ? `(${st.section})` : ''}
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{st.gender || '—'}</span>
                    </td>
                    <td>{st.reading_score ?? '—'}</td>
                    <td>{st.writing_score ?? '—'}</td>
                    <td>
                      {st.math_score !== null && st.math_score !== undefined ? (
                        st.math_score
                      ) : st.predicted_math_score ? (
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>
                          {st.predicted_math_score}*
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {st.average_score > 0 ? (
                        <strong
                          style={{
                            color:
                              st.average_score < 60
                                ? '#dc2626'
                                : st.average_score >= 80
                                ? '#059669'
                                : '#2563eb',
                          }}
                        >
                          {st.average_score}
                        </strong>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          st.support_category === 'Immediate Support Needed'
                            ? 'badge-danger'
                            : st.support_category === 'Needs Improvement'
                            ? 'badge-warning'
                            : st.support_category === 'Strong Performance'
                            ? 'badge-success'
                            : 'badge-primary'
                        }`}
                      >
                        {st.support_category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(st.id, st.student_id, st.name)}
                        className="btn btn-danger"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        title={`Delete ${st.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              No matching student records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
