import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Sparkles, Info } from 'lucide-react';
import { api } from '../api/client';

const SAMPLE_CSV = `student_id,name,class_name,reading_score,writing_score,math_score,gender,race_ethnicity,parental_education,lunch,test_preparation
BCA-2026-001,Aarav Sharma,BCA 3rd Year,78,82,75,male,group C,bachelor's degree,standard,completed
BCA-2026-002,Priya Patel,BCA 3rd Year,52,48,45,female,group B,high school,free/reduced,none
BCA-2026-003,Rohan Verma,BCA 3rd Year,88,91,,male,group D,master's degree,standard,completed
BCA-2026-004,Sneha Sen,BCA 3rd Year,35,38,,female,group A,some high school,free/reduced,none`;

const KAGGLE_FORMAT_CSV = `gender,race/ethnicity,parental level of education,lunch,test preparation course,math score,reading score,writing score
female,group B,bachelor's degree,standard,none,72,72,74
female,group C,some college,standard,completed,69,90,88
female,group B,master's degree,standard,none,90,95,93
male,group A,associate's degree,free/reduced,none,47,57,44`;

export default function CsvUploadPage({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please drop a valid .csv spreadsheet file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setReport(null);

    if (!file) {
      setError('Please select or drag a .csv file to upload.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await api.uploadCsv(formData);
      setReport(data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.data?.error || err.message || 'Error uploading or processing CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'edupulse_students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadKaggleSample = () => {
    const blob = new Blob([KAGGLE_FORMAT_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kaggle_students_performance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={22} color="#2563eb" /> Dynamic Student Marks CSV Ingestion
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
          Upload any student dataset or exam marksheet. Our system automatically recognizes headers, handles missing columns, auto-generates IDs, and executes ML predictions.
        </p>
      </div>

      <div className="grid-2">
        {/* Upload Form Card */}
        <div className="portal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              Upload CSV Spreadsheet
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleDownloadSample}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '5px 8px' }}
                title="Download template with IDs and Classes"
              >
                <Download size={12} /> Standard Template
              </button>
              <button
                onClick={handleDownloadKaggleSample}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '5px 8px' }}
                title="Download Kaggle benchmark exam dataset without IDs"
              >
                <Download size={12} /> Kaggle Format
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? '#2563eb' : '#cbd5e1'}`,
                backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
                borderRadius: '10px',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '16px',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  marginBottom: '12px',
                }}
              >
                <Upload size={24} />
              </div>

              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>
                {file ? file.name : 'Click to select or drag and drop any CSV file here'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports any column layout • Auto-matches aliases'}
              </div>
            </div>

            {error && (
              <div className="alert-box alert-error">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <Upload size={16} />
              {loading ? 'Processing & Inferencing CSV...' : 'Upload & Process Batch'}
            </button>
          </form>

          {report && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '15px' }}>
                <CheckCircle2 size={18} /> {report.message || 'CSV Import Complete'}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  marginTop: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Created</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                    {report.created ?? 0}
                  </div>
                </div>
                <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Updated</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1d4ed8' }}>
                    {report.updated ?? 0}
                  </div>
                </div>
                <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Warnings/Clamped</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: report.errors?.length ? '#d97706' : '#64748b' }}>
                    {report.errors?.length || 0}
                  </div>
                </div>
              </div>

              {/* Detected Column Mapping */}
              {report.detected_columns && Object.keys(report.detected_columns).length > 0 && (
                <div style={{ marginTop: '14px', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                    Auto-Mapped Columns Detected:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Object.entries(report.detected_columns).map(([field, origHdr]) => (
                      <span
                        key={field}
                        style={{
                          fontSize: '11px',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <strong>{origHdr}</strong> &rarr; {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.auto_generated && report.auto_generated.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                  <Info size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Auto-filled defaults for unprovided fields: {report.auto_generated.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Ingestion Capabilities Info Card */}
        <div className="portal-card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={18} color="#2563eb" /> Universal &amp; Resilient CSV Parsing
          </h3>

          <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '12px' }}>
              Unlike rigid parsers, EduPulse AI dynamically recognizes column headers, tolerates variations in naming, and gracefully infers missing fields.
            </p>

            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '13px', marginBottom: '6px' }}>
                Smart Alias Detection System
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#1e40af' }}>
                <li><strong>Student Roll/ID:</strong> Matched from <code>id</code>, <code>roll</code>, <code>roll_no</code>, <code>registration</code>, or auto-generated as <code>STU-0001...</code></li>
                <li><strong>Student Name:</strong> Matched from <code>name</code>, <code>student_name</code>, <code>full_name</code>, or defaulted to <code>Student 1...</code></li>
                <li><strong>Class/Batch:</strong> Matched from <code>class</code>, <code>course</code>, <code>batch</code>, or defaulted to <code>Unassigned</code></li>
                <li><strong>Exam Marks:</strong> Matches <code>reading score</code>, <code>writing score</code>, <code>math score</code> (with or without spaces/underscores).</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px', fontSize: '12px' }}>
                Automated ML Regressor Scoring:
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                If <code>math_score</code> is omitted or blank, the system automatically uses demographic attributes and reading/writing scores to predict the mathematics score via the trained Scikit-Learn regression pipeline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
