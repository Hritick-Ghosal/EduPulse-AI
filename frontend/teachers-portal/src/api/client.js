const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/academics').replace(/\/+$/, '');

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = { ...(options.headers || {}) };

  const token = localStorage.getItem('teacher_token');
  if (token && !headers.Authorization) {
    headers.Authorization = `Token ${token}`;
  }

  // Do not set Content-Type if body is FormData (browser will set boundary automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('teacher_info');
    window.dispatchEvent(new CustomEvent('teacher:unauthorized'));
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || 'Session expired or unauthorized');
    error.status = 401;
    error.data = errorData;
    throw error;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  login: (username, password) =>
    apiRequest('/teacher/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    apiRequest('/teacher/logout/', {
      method: 'POST',
    }),

  getAnalytics: () => apiRequest('/analytics/'),

  getStudents: () => apiRequest('/students/'),

  createStudent: (studentData) =>
    apiRequest('/students/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  deleteStudent: (studentId) =>
    apiRequest(`/students/${studentId}/`, {
      method: 'DELETE',
    }),

  predictMathScore: (payload) =>
    apiRequest('/predict/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  uploadCsv: (formData) =>
    apiRequest('/upload-csv/', {
      method: 'POST',
      body: formData,
    }),
};

export default api;
