import { useState, useMemo } from 'react';
import {
  RefreshCw,
  BarChart2,
  PieChart as PieIcon,
  Users,
  TrendingUp,
  Search,
  XCircle,
  Award,
  BookOpen
} from 'lucide-react';
import KpiCards from '../components/KpiCards';
import { SimplePieChart, SimpleBarChart, SimpleDonutChart } from '../components/Charts';
import ActivityLog from '../components/ActivityLog';

const TIER_COLORS = {
  'Immediate Support Needed': '#dc2626',
  'Needs Improvement': '#d97706',
  'Satisfactory': '#2563eb',
  'Strong Performance': '#059669',
  'Unassessed': '#94a3b8',
};

export default function DashboardPage({ analytics, loading, onRefresh }) {
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [listMode, setListMode] = useState('all'); // 'all' | 'candidates' | 'at-risk'

  const allStudents = useMemo(() => analytics?.all_students || [], [analytics]);

  // Extract unique classes for filter
  const classOptions = useMemo(() => {
    const set = new Set();
    allStudents.forEach((s) => {
      if (s.class_name) set.add(s.class_name);
    });
    return Array.from(set).sort();
  }, [allStudents]);

  // Filter students based on search, class, and list mode
  const filteredStudents = useMemo(() => {
    return allStudents.filter((st) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (st.name || '').toLowerCase().includes(q) ||
        (st.student_id || '').toLowerCase().includes(q) ||
        (st.class_name || '').toLowerCase().includes(q);

      const matchClass = selectedClass === 'all' || st.class_name === selectedClass;
      const matchTier = selectedTier === 'all' || st.support_category === selectedTier;

      let matchMode = true;
      if (listMode === 'at-risk') {
        matchMode = st.average_score > 0 && st.average_score < 60;
      } else if (listMode === 'candidates') {
        // Upgrade candidates: within 8 points of the next tier
        const gap = st.upgrade?.score_gap || 0;
        matchMode = gap > 0 && gap <= 8;
      }

      return matchSearch && matchClass && matchTier && matchMode;
    });
  }, [allStudents, search, selectedClass, selectedTier, listMode]);

  // Handle student selection
  const handleToggleSelect = (sid) => {
    setSelectedStudentIds((prev) =>
      prev.includes(sid) ? prev.filter((id) => id !== sid) : [...prev, sid]
    );
  };

  const handleSelectAllVisible = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.student_id));
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Determine active dataset for charts: Selected students OR filtered cohort
  const chartStudents = useMemo(() => {
    if (selectedStudentIds.length > 0) {
      return allStudents.filter((s) => selectedStudentIds.includes(s.student_id));
    }
    return filteredStudents.length > 0 ? filteredStudents : allStudents;
  }, [selectedStudentIds, allStudents, filteredStudents]);

  const isSelectionActive = selectedStudentIds.length > 0;

  // 1. Dynamic Performance Bands Data
  const chartBandsData = useMemo(() => {
    const counts = {
      'Immediate Support Needed': 0,
      'Needs Improvement': 0,
      'Satisfactory': 0,
      'Strong Performance': 0,
    };
    chartStudents.forEach((s) => {
      if (counts[s.support_category] !== undefined) {
        counts[s.support_category] += 1;
      }
    });
    return [
      { label: 'Immediate (<40)', value: counts['Immediate Support Needed'], color: TIER_COLORS['Immediate Support Needed'] },
      { label: 'Improvement (40–59)', value: counts['Needs Improvement'], color: TIER_COLORS['Needs Improvement'] },
      { label: 'Satisfactory (60–79)', value: counts['Satisfactory'], color: TIER_COLORS['Satisfactory'] },
      { label: 'Strong (80–100)', value: counts['Strong Performance'], color: TIER_COLORS['Strong Performance'] },
    ];
  }, [chartStudents]);

  // 2. Dynamic Subject Averages Bar Chart Data
  const chartAveragesData = useMemo(() => {
    if (chartStudents.length === 0) {
      return [
        { label: 'Math Avg', value: analytics?.averages?.math || 0, color: '#2563eb' },
        { label: 'Reading Avg', value: analytics?.averages?.reading || 0, color: '#059669' },
        { label: 'Writing Avg', value: analytics?.averages?.writing || 0, color: '#7c3aed' },
      ];
    }
    let mSum = 0, rSum = 0, wSum = 0, mCount = 0, rCount = 0, wCount = 0;
    chartStudents.forEach((s) => {
      const m = s.math_score !== null ? s.math_score : s.predicted_math_score;
      if (m !== null && m !== undefined) { mSum += m; mCount++; }
      if (s.reading_score !== null && s.reading_score !== undefined) { rSum += s.reading_score; rCount++; }
      if (s.writing_score !== null && s.writing_score !== undefined) { wSum += s.writing_score; wCount++; }
    });
    return [
      { label: 'Math', value: mCount > 0 ? parseFloat((mSum / mCount).toFixed(1)) : 0, color: '#2563eb' },
      { label: 'Reading', value: rCount > 0 ? parseFloat((rSum / rCount).toFixed(1)) : 0, color: '#059669' },
      { label: 'Writing', value: wCount > 0 ? parseFloat((wSum / wCount).toFixed(1)) : 0, color: '#7c3aed' },
    ];
  }, [chartStudents, analytics]);

  // 3. Dynamic Gender Distribution Donut Chart Data
  const chartGenderData = useMemo(() => {
    let female = 0, male = 0, other = 0;
    chartStudents.forEach((s) => {
      const g = (s.gender || '').toLowerCase();
      if (g === 'female') female++;
      else if (g === 'male') male++;
      else other++;
    });
    return [
      { label: 'Female', value: female, color: '#ec4899' },
      { label: 'Male', value: male, color: '#3b82f6' },
      ...(other > 0 ? [{ label: 'Other', value: other, color: '#8b5cf6' }] : []),
    ];
  }, [chartStudents]);

  // 4. Class Distribution Bar Chart Data
  const chartClassData = useMemo(() => {
    const counts = {};
    chartStudents.forEach((s) => {
      const c = s.class_name || 'Unassigned';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      color: '#4f46e5',
    }));
  }, [chartStudents]);

  // Single focused student for upgrade analysis
  const focusedStudent = useMemo(() => {
    if (selectedStudentIds.length === 1) {
      return allStudents.find((s) => s.student_id === selectedStudentIds[0]);
    }
    return null;
  }, [selectedStudentIds, allStudents]);

  return (
    <div>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <BarChart2 size={24} color="#2563eb" /> Teacher Academic Dashboard &amp; Upgrade Intelligence
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Interactive student performance analytics, automated support tier projections, and smart upgrade pathways.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isSelectionActive && (
            <button
              onClick={handleClearSelection}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              <XCircle size={14} /> Clear Selection ({selectedStudentIds.length})
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="btn btn-secondary"
              style={{ fontSize: '13px' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh Metrics'}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <KpiCards analytics={analytics} />

      {/* Interactive Selection Notice / Student Focus Card */}
      {focusedStudent ? (
        <div className="interactive-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  TARGET STUDENT FOCUS
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Roll: <strong>{focusedStudent.student_id}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                {focusedStudent.name} ({focusedStudent.class_name} {focusedStudent.section ? `• Sec ${focusedStudent.section}` : ''})
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                Current 3-Subject Average: <strong>{focusedStudent.average_score}</strong> • Tier:{' '}
                <span style={{ color: TIER_COLORS[focusedStudent.support_category] || '#2563eb', fontWeight: 700 }}>
                  {focusedStudent.support_category}
                </span>
              </p>
            </div>

            {/* Upgrade Section Box */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '12px 16px',
                minWidth: '280px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                <TrendingUp size={16} /> Upgrade Section &amp; Action Plan
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                Target Tier: <strong>{focusedStudent.upgrade?.next_tier}</strong> (Goal: {focusedStudent.upgrade?.target_score} pts)
              </div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                Score Gap: {focusedStudent.upgrade?.score_gap > 0 ? `+${focusedStudent.upgrade?.score_gap} pts needed` : 'Highest tier achieved!'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                Suggested: {focusedStudent.upgrade?.action}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Math Score</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>
                {focusedStudent.math_score !== null ? focusedStudent.math_score : `${focusedStudent.predicted_math_score}*`}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Reading Score</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                {focusedStudent.reading_score ?? '—'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Writing Score</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#7c3aed' }}>
                {focusedStudent.writing_score ?? '—'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Class Math Avg</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#64748b' }}>
                {analytics?.averages?.math || 0}
              </div>
            </div>
          </div>
        </div>
      ) : isSelectionActive ? (
        <div className="interactive-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                MULTI-STUDENT SELECTION ACTIVE
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                Displaying Charts &amp; Metrics for {selectedStudentIds.length} Selected Students
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                The pie charts and bar charts below are actively filtered to show the aggregated data for your selected cohort.
              </p>
            </div>
            <button onClick={handleClearSelection} className="btn btn-secondary" style={{ fontSize: '12px' }}>
              Reset to Full Cohort
            </button>
          </div>
        </div>
      ) : null}

      {/* Dynamic Graphs & Pie Charts Row */}
      <div className="grid-2">
        {/* Chart 1: Performance Tiers Pie Chart */}
        <div className="portal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PieIcon size={18} color="#2563eb" /> Performance Tiers Distribution
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {isSelectionActive ? `${chartStudents.length} Selected` : 'Full Cohort'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
            Proportion of students across intervention and achievement tiers.
          </p>
          <SimplePieChart data={chartBandsData} size={210} />
        </div>

        {/* Chart 2: Subject Competency Bar Chart */}
        <div className="portal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={18} color="#2563eb" /> Subject Mean Competency Scores
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {isSelectionActive ? 'Selected Students Mean' : 'Cohort Baseline'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
            Comparison of actual/predicted math, reading comprehension, and writing proficiency.
          </p>
          <SimpleBarChart data={chartAveragesData} height={210} />
        </div>
      </div>

      <div className="grid-2">
        {/* Chart 3: Gender Distribution Donut Chart */}
        <div className="portal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={18} color="#ec4899" /> Gender Representation Breakdown
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {chartStudents.length} Students
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
            Demographic parity monitoring across evaluated students.
          </p>
          <SimpleDonutChart data={chartGenderData} size={190} thickness={30} />
        </div>

        {/* Chart 4: Class Enrollment Bar Chart */}
        <div className="portal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={18} color="#4f46e5" /> Class &amp; Cohort Distribution
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Active Programs
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
            Roster distribution across classes and academic sections.
          </p>
          <SimpleBarChart data={chartClassData} height={190} />
        </div>
      </div>

      {/* Comprehensive Student Roster & Upgrade Sections Table */}
      <div className="portal-card">
        {/* Table Controls & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#2563eb" /> Students Roster &amp; Academic Upgrade Section
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Click any student row or checkbox to instantly update the graphs &amp; charts to their profile.
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setListMode('all')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: listMode === 'all' ? '#ffffff' : 'transparent',
                color: listMode === 'all' ? '#1e293b' : '#64748b',
                boxShadow: listMode === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              All Students ({allStudents.length})
            </button>
            <button
              onClick={() => setListMode('candidates')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: listMode === 'candidates' ? '#ffffff' : 'transparent',
                color: listMode === 'candidates' ? '#d97706' : '#64748b',
                boxShadow: listMode === 'candidates' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Upgrade Candidates
            </button>
            <button
              onClick={() => setListMode('at-risk')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: listMode === 'at-risk' ? '#ffffff' : 'transparent',
                color: listMode === 'at-risk' ? '#dc2626' : '#64748b',
                boxShadow: listMode === 'at-risk' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              At-Risk Only ({analytics?.at_risk_students?.length || 0})
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={14}
              color="#94a3b8"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by name, roll, class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', width: '100%' }}
            />
          </div>

          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="all">All Classes</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
            <option value="all">All Support Tiers</option>
            <option value="Immediate Support Needed">Immediate Support Needed (&lt;40)</option>
            <option value="Needs Improvement">Needs Improvement (40–59)</option>
            <option value="Satisfactory">Satisfactory (60–79)</option>
            <option value="Strong Performance">Strong Performance (80–100)</option>
          </select>

          <button
            onClick={handleSelectAllVisible}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 10px' }}
          >
            {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
              ? 'Deselect All'
              : 'Select All Visible'}
          </button>

          <div className="filter-count">
            Showing {filteredStudents.length} of {allStudents.length} students
          </div>
        </div>

        {/* Table Body */}
        {filteredStudents.length > 0 ? (
          <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedStudentIds.length > 0 &&
                        selectedStudentIds.length === filteredStudents.length
                      }
                      onChange={handleSelectAllVisible}
                    />
                  </th>
                  <th>Roll / ID</th>
                  <th>Student Name</th>
                  <th>Class &amp; Section</th>
                  <th>Reading</th>
                  <th>Writing</th>
                  <th>Math (Act/Pred)</th>
                  <th>Average</th>
                  <th>Current Tier</th>
                  <th>Upgrade Action &amp; Goal</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const isSelected = selectedStudentIds.includes(st.student_id);
                  const isAtRisk = st.average_score > 0 && st.average_score < 60;
                  const isTop = st.average_score >= 80;

                  return (
                    <tr
                      key={st.id || st.student_id}
                      className={isSelected ? 'selected-row' : ''}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleSelect(st.student_id)}
                    >
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(st.student_id)}
                        />
                      </td>
                      <td>
                        <strong>{st.student_id}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{st.name}</div>
                        {st.email && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{st.email}</div>}
                      </td>
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
                        <strong
                          style={{
                            color: isAtRisk ? '#dc2626' : isTop ? '#059669' : '#2563eb',
                            fontSize: '14px',
                          }}
                        >
                          {st.average_score}
                        </strong>
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
                      <td>
                        <div style={{ fontSize: '12px' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {st.upgrade?.next_tier}
                          </span>
                          {st.upgrade?.score_gap > 0 && (
                            <span style={{ color: '#059669', marginLeft: '6px', fontWeight: 700 }}>
                              (+{st.upgrade.score_gap} pts)
                            </span>
                          )}
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {st.upgrade?.action}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: '40px 16px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              color: '#64748b',
              fontSize: '13px',
            }}
          >
            No student records match the current filter criteria.
          </div>
        )}
      </div>

      {/* Activity Log Trail */}
      <ActivityLog activities={analytics?.recent_activities} />
    </div>
  );
}
