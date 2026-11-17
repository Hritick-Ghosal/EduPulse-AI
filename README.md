# EduPulse AI — Smart Study Assistant & Performance Analytics

A full-stack Generative AI study portal and predictive analytics platform built with **React (Vite)**, **Django**, **MongoDB Atlas**, and **Groq LPU API**, paired with a **Scikit-Learn** student performance pipeline.

---

## Repository Structure

```text
EduPLuse-AI/
├── backend/
│   ├── authentication/          # Auth, MongoDB config (db_config.py), Groq AI & quiz endpoints
│   ├── core_backend/            # Django settings, CORS config & URL routing
│   ├── ml_models/               # Serialized ML pipeline (student_math_pipeline.joblib)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   └── EduPulse AI/src/         # React UI (index.jsx, login.jsx, QuizPanel.jsx, AnalyticsPanel.jsx)
├── data/
│   └── StudentsPerformance.csv  # Student exam dataset (1,000 records)
├── notebooks/
│   ├── 01_eda.ipynb             # Exploratory Data Analysis & visualizations
│   └── 02_modeling.ipynb        # Model training, evaluation & pipeline export
└── docker-compose.yml

Running EduPulse AI on Another Laptop
1. Clone the Repository
PowerShell
git clone https://github.com/Hritick-Ghosal/EduPulse-AI.git
cd EduPulse-AI

2. Install Backend Dependencies
PowerShell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt certifi
3. Add Environment Secrets (backend/.env)
Create backend/.env and paste your credentials:

Code snippet
MONGO_DB_USER=<your_mongo_user>
MONGO_DB_PASSWORD=<your_mongo_password>
MONGO_DB_CLUSTER=<your_mongo_cluster>
MONGO_DB_NAME=edupulse_db
GROQ_API_KEY=<your_groq_api_key>
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

4. Install Frontend Dependencies
PowerShell
cd "frontend/EduPulse AI"
npm install

5. Run Both Servers
Terminal 1 (Backend):

PowerShell
cd backend
..\.venv\Scripts\python.exe manage.py runserver
Terminal 2 (Frontend):

PowerShell
cd "frontend/EduPulse AI"
npm run dev

KEY MODIFICATIONS MADE :
1. Added Dataset, Notebooks & ML Pipeline (New Files)
The base repository only contained a Generative AI web app and had no tabular ML artifacts. You created and added:

data/StudentsPerformance.csv: Added the 1,000-row Kaggle student exam dataset.

notebooks/01_eda.ipynb: Built the Exploratory Data Analysis notebook to analyze score distributions, correlations, and demographic/test-prep factors.

notebooks/02_modeling.ipynb: Built the Machine Learning training and evaluation notebook for predicting student math scores and identifying at-risk students.

backend/ml_models/student_math_pipeline.joblib: Exported the trained Scikit-Learn preprocessing and prediction pipeline.

2. Backend Code Modifications (backend/)
backend/core_backend/settings.py: Removed an invalid "true" string from the CORS_ALLOWED_ORIGINS list so Django's system check passes without crashing on startup.

backend/authentication/db_config.py: Updated the MongoDB Atlas connection to load credentials dynamically from .env (pointing to your active cluster instead of the old unreachable one) and added tlsCAFile=certifi.where() inside MongoClient(...) to fix Windows SSL/TLS handshake errors.

3. Frontend API Routing & UI Updates (frontend/EduPulse AI/src/)
Switched Hardcoded Production URLs to Localhost: Replaced [https://edu-p-luse-backend-ai.vercel.app](https://edu-p-luse-backend-ai.vercel.app) with [http://127.0.0.1:8000](http://127.0.0.1:8000) so the React frontend connects to your local Django server instead of the broken deployed backend:

src/index.jsx (Lines 269 & 324): Updated both /api/auth/chat/ endpoints.

src/login.jsx (Lines 109, 125 & 142): Updated /api/auth/login/, /api/auth/register/, and /api/auth/forgot-password/ endpoints.

src/QuizPanel.jsx (Line 38): Updated the /api/auth/generate-quiz/ endpoint.

Updated Frontend Views & Styling: Refined AnalyticsPanel.jsx, Sidebar.jsx, main.jsx, and assets/styles.css to support local rendering and analytics integration.

4. Local Environment & Security Configuration (Untracked / Git-Ignored)
Created backend/.env: Configured your own MONGO_DB_USER, MONGO_DB_PASSWORD, MONGO_DB_CLUSTER, MONGO_DB_NAME, GROQ_API_KEY, and CORS_ALLOWED_ORIGINS.

Updated .gitignore: Added .env, backend/.env, .venv/, node_modules/, and __pycache__/ so secrets and heavy dependencies are excluded when pushing to GitHub.

Created README.md: Documented the project architecture, tech stack, modification log, and local setup instructions
