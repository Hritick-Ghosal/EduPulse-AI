import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Calculator, Users, Upload } from 'lucide-react';
import { useAuth } from './context/useAuth';
import { api } from './api/client';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PredictorPage from './pages/PredictorPage';
import StudentsPage from './pages/StudentsPage';
import CsvUploadPage from './pages/CsvUploadPage';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [anaData, stuData] = await Promise.all([
        api.getAnalytics(),
        api.getStudents(),
      ]);
      setAnalytics(anaData);
      setStudents(stuData.students || []);
    } catch (err) {
      console.error('Failed to load academic data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let ignore = false;
    if (isAuthenticated) {
      api.getAnalytics().then(
        (anaData) => {
          if (!ignore) setAnalytics(anaData);
        },
        (err) => {
          if (!ignore) console.error('Failed to load analytics:', err);
        }
      );
      api.getStudents().then(
        (stuData) => {
          if (!ignore) setStudents(stuData.students || []);
        },
        (err) => {
          if (!ignore) console.error('Failed to load students:', err);
        }
      );
    }
    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Class Analytics & At-Risk', icon: BarChart3 },
    { id: 'predict', label: 'ML Math Score Predictor', icon: Calculator },
    { id: 'students', label: 'Student Records', icon: Users },
    { id: 'upload', label: 'Bulk CSV Upload', icon: Upload },
  ];

  return (
    <div className="app-container">
      <Navbar />

      <main className="portal-wrapper">
        <nav className="tab-nav" aria-label="Portal Navigation Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${active ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === 'dashboard' && (
          <DashboardPage
            analytics={analytics}
            loading={loading}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'predict' && (
          <PredictorPage
            students={students}
            onPredictionSaved={fetchData}
          />
        )}

        {activeTab === 'students' && (
          <StudentsPage
            students={students}
            allStudents={analytics?.all_students || []}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'upload' && (
          <CsvUploadPage
            onUploadSuccess={fetchData}
          />
        )}
      </main>

      <footer
        style={{
          textAlign: 'center',
          padding: '16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          color: '#94a3b8',
          fontSize: '12px',
        }}
      >
        EduPulse AI • Academic Performance Monitoring &amp; Decision Support System
      </footer>
    </div>
  );
}
