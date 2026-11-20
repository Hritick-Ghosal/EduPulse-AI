# 🚀 EduPulse AI — First-Time Laptop Setup & Installation Guide

Welcome to **EduPulse AI**! This guide is designed for anyone setting up and running the project for the **very first time** on a brand-new or different laptop (Windows, macOS, or Linux).

---

## ⚡ Quick Summary: Choose Your Setup Method

| Method | Best For | Prerequisites Needed | Setup Time | Difficulty |
| :--- | :--- | :--- | :---: | :---: |
| 🐳 **Method 1: One-Click Docker** *(Recommended)* | Running the whole system with zero code or package installation | **Docker Desktop** + **Git** | ~2–3 minutes | ⭐ Easy |
| 💻 **Method 2: Manual Development** | Active coding, modifying code, or training ML models locally | **Python 3.10+**, **Node.js 18+**, **Git** | ~5–7 minutes | ⭐⭐ Medium |

---

## 📦 What Libraries Are Needed & Where Are They Installed?

EduPulse AI consists of **three core services**. Here is the exact list of libraries and what each one does:

### 1. ⚙️ Backend (Python / Django / Machine Learning)
These packages are listed in `backend/requirements.txt` (and root `requirements.txt`). When running natively, they are installed into a Python virtual environment (`.venv`). When running Docker, they are automatically installed inside the backend container.

| Library / Package | Version Range | Purpose in EduPulse AI |
| :--- | :--- | :--- |
| **`django`** | `>=5.0,<6.0` | Core web framework, SQLite ORM for students & grades, admin panel |
| **`django-cors-headers`** | `>=4.3.0` | Allows cross-origin requests from React frontends to Django API |
| **`pymongo`** | `>=4.6.0` | Python driver to connect with MongoDB Atlas for student profiles & chat |
| **`dnspython`** | `>=2.5.0` | Required for resolving `mongodb+srv://` DNS SRV connection strings |
| **`certifi`** | `>=2024.2.2` | Up-to-date Mozilla SSL/TLS root certificates to prevent Windows handshake errors |
| **`python-dotenv`** | `>=1.0.0` | Loads credentials & environment variables from `.env` files into Django |
| **`groq`** | `>=0.9.0` | Official client for Groq LPU high-speed inference (LLaMA-3 Study AI) |
| **`bcrypt`** | `>=4.1.0` | Secure password hashing for user authentication |
| **`numpy`** | `>=1.26.0` | Numerical calculations, array vectorization for student mark predictions |
| **`pandas`** | `>=2.1.0` | High-speed tabular CSV parsing, DataFrame manipulation for grade records |
| **`scikit-learn`** | `>=1.4.0` | Pretrained Linear Regression & Random Forest pipeline for math score estimation |
| **`scipy`** | `>=1.11.0` | Scientific computing dependency used by Scikit-Learn |
| **`joblib`** | `>=1.3.0` | High-performance serialization loader for `student_math_pipeline.joblib` |
| **`cloudpickle`** | `>=3.0.0` | Extended object serialization for custom ML transformers and pipelines |
| **`gunicorn`** | `>=21.2.0` | High-performance WSGI HTTP server used in the Docker production container |

---

### 2. 🧑‍🎓 Student Portal (`frontend/EduPulse AI`)
Defined in `frontend/EduPulse AI/package.json`. Installed via `npm install`:
- **`react` & `react-dom`** (`^19.0.0`): Core UI library.
- **`lucide-react`**: Vector icons for the chatbot, quiz panel, and analytics.
- **`vite`**: Ultra-fast bundler and local development web server.
- **`tailwindcss`**: Utility-first CSS engine for responsive styling.

---

### 3. 👩‍🏫 Teacher Portal (`frontend/teachers-portal`)
Defined in `frontend/teachers-portal/package.json`. Installed via `npm install`:
- **`react` & `react-dom`** (`^19.0.0`): Standalone teacher portal UI.
- **`lucide-react`**: Academic icons for grade tables, CSV dropzones, and cohort filters.
- **`vite`**: Bundler and dev server.
- **Custom Pure SVG Engine**: Zero-dependency charting suite (`SimplePieChart`, `SimpleBarChart`, `SimpleDonutChart`) embedded directly in `src/components/Charts.jsx`.

---

## 🐳 Method 1: The One-Click Docker Setup (Recommended)

> [!NOTE]
> **Why Docker?**
> You do **not** need to install Python, Node.js, npm, or any compilers. Docker will build the isolated containers, automatically download all Python & Node packages, run database migrations, and pre-seed the teacher account.

### Step 1: Install Prerequisites (One-Time)
1. Download and install **[Git](https://git-scm.com/downloads)**.
2. Download and install **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**.
3. **Launch Docker Desktop** and wait until the whale icon in the taskbar is steady green (stating *"Docker Engine is running"*).

### Step 2: Clone the Project
Open a terminal (PowerShell, Command Prompt, or Terminal) and run:
```bash
git clone https://github.com/Hritick-Ghosal/EduPulse-AI.git
cd EduPulse-AI
```

### Step 3: Run the Turnkey Docker Launcher
Choose the option that fits your operating system:

* **Windows (Fastest - Double Click)**:
  Simply double-click **`run_docker.bat`** in the project folder!
  *(Or run `.\run_docker.bat` from Command Prompt)*

* **Windows (PowerShell)**:
  ```powershell
  .\run_docker.ps1
  ```

* **macOS / Linux / Standard Docker CLI**:
  ```bash
  docker compose up --build -d
  ```

### What Happens Automatically Behind the Scenes?
1. The script checks for `.env` files; if missing, it automatically creates them from `.env.example` templates.
2. The Docker daemon builds all 3 images:
   - **Backend**: Pulls Python 3.11, runs `pip install -r requirements.txt`, runs `python manage.py migrate`, and automatically creates the `teacher1` (`Teacher@123`) account.
   - **Student App**: Pulls Node 20, runs `npm install`, compiles the React production assets, and serves them via Nginx on port `80`.
   - **Teacher Portal**: Pulls Node 20, runs `npm install`, compiles assets, and serves them via Nginx on port `8080`.

### Step 4: Access the Applications in Your Browser

| Application | Browser URL | Credentials / Actions |
| :--- | :--- | :--- |
| **👩‍🏫 Teacher Portal** | **[http://localhost:8080](http://localhost:8080)** | **Username:** `teacher1`<br/>**Password:** `Teacher@123` |
| **🧑‍🎓 Student Portal** | **[http://localhost:80](http://localhost:80)** (or `http://localhost`) | Register or explore features |
| **⚙️ Django Backend API** | **[http://localhost:8000/api/academics/](http://localhost:8000/api/academics/)** | Health status & API directory |

### How to Stop Docker Containers
When you are done testing, double-click **`stop_docker.bat`** or run:
```bash
docker compose down
```

---

## 💻 Method 2: Manual Local Development Setup

Follow this method if you wish to run the servers directly in your terminal for code development, debugging, or custom model training.

### Step 1: Install System Prerequisites
Ensure your laptop has:
1. **Python 3.10+**: Download from [python.org](https://www.python.org/downloads/) *(On Windows, check the box **"Add Python to PATH"** during installation)*.
2. **Node.js 18+ & npm**: Download from [nodejs.org](https://nodejs.org/) (LTS recommended).
3. **Git**: Download from [git-scm.com](https://git-scm.com/).

---

### Step 2: Clone the Project
```bash
git clone https://github.com/Hritick-Ghosal/EduPulse-AI.git
cd EduPulse-AI
```

---

### Step 3: Setup the Python Backend

1. **Create and Activate a Virtual Environment**:
   * **Windows PowerShell**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
     *(If PowerShell gives a script execution error, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*
   * **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

2. **Install All Backend Libraries**:
   ```bash
   pip install --upgrade pip
   pip install -r backend/requirements.txt certifi
   ```

3. **Configure Environment File**:
   Copy the example environment template into `backend/.env`:
   * **Windows**:
     ```cmd
     copy backend\.env.example backend\.env
     ```
   * **macOS / Linux**:
     ```bash
     cp backend/.env.example backend/.env
     ```

4. **Apply Database Migrations & Seed Default Teacher**:
   ```bash
   cd backend
   python manage.py migrate
   python manage.py seed_teacher
   ```
   > [!TIP]
   > The `seed_teacher` command initializes the default credentials: **`teacher1`** / **`Teacher@123`**.

5. **Start the Django Backend Server**:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   *Leave this terminal open. Backend is active at `http://127.0.0.1:8000/api/academics/`.*

---

### Step 4: Setup the Student Web App (`frontend/EduPulse AI`)

1. Open a **second terminal** and navigate to the student portal:
   ```bash
   cd "EduPulse-AI/frontend/EduPulse AI"
   ```

2. Install Node.js packages:
   ```bash
   npm install
   ```

3. Launch the Vite dev server on port `5173`:
   ```bash
   npm run dev -- --port 5173
   ```
   *Leave this terminal open. Access at `http://localhost:5173`.*

---

### Step 5: Setup the Teacher Portal (`frontend/teachers-portal`)

1. Open a **third terminal** and navigate to the teacher portal:
   ```bash
   cd "EduPulse-AI/frontend/teachers-portal"
   ```

2. Install Node.js packages:
   ```bash
   npm install
   ```

3. Launch the Vite dev server on port `5174`:
   ```bash
   npm run dev -- --port 5174
   ```
   *Leave this terminal open. Access at `http://localhost:5174` and log in with `teacher1` / `Teacher@123`.*

---

## 🔑 Environment Variables Guide (`.env`)

If you want to use the Student Portal's **LLM Study Assistant** and **Dynamic Quiz Generator**, configure these keys in `backend/.env`:

```ini
# 1. Groq LPU Key (Free, fast LLaMA-3 inference)
# Sign up at https://console.groq.com and click "Create API Key"
GROQ_API_KEY=gsk_your_key_here

# 2. MongoDB Atlas (Student Profile & Chat Persistence)
# Sign up at https://www.mongodb.com/cloud/atlas and create a free M0 cluster
MONGO_DB_USER=your_user
MONGO_DB_PASSWORD=your_password
MONGO_DB_CLUSTER=your_cluster.mongodb.net
MONGO_DB_NAME=edupulse_db

# 3. CORS Origins (Required for frontends to talk to backend)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:8080,http://127.0.0.1:8080,http://localhost:80,http://localhost,http://127.0.0.1
```

> [!NOTE]
> Even without Groq or MongoDB configured, the **Teacher Portal**, **Dynamic CSV Ingestion**, **Scikit-Learn ML Predictions**, and **Student Support Upgrade System** will function with 100% full capability using the local SQLite database!

---

## 🛠️ Common Troubleshooting on New Laptops

### 1. `docker: error during connect ... npipe` (Windows)
* **Cause**: Docker Desktop is closed or its Linux subsystem is still starting up.
* **Fix**: Open Docker Desktop from the Start Menu. Wait 30–60 seconds until the status shows "Engine running", then re-run `run_docker.bat`.

### 2. `Activate.ps1 cannot be loaded because running scripts is disabled` (Windows PowerShell)
* **Cause**: Windows PowerShell security policy restricts unsigned local scripts.
* **Fix**: Open PowerShell as Administrator or run:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### 3. Port Conflicts (`8000`, `8080`, or `80` already in use)
* **Check which process is using the port**:
  * Windows: `netstat -ano | findstr :8000`
  * macOS / Linux: `lsof -i :8000`
* **Fix**: Stop the conflicting app, or change the exposed port in `docker-compose.yml` (e.g., change `"8080:80"` to `"8090:80"`).

### 4. Windows Python alias opens Microsoft Store
* **Cause**: Windows has a stub for `python.exe` enabled by default.
* **Fix**: In Windows Settings, search for **"Manage app execution aliases"** and turn **OFF** the toggles for **"App Installer (python.exe)"** and **"App Installer (python3.exe)"**.

---

<p align="center">
  <b>EduPulse AI</b> — Ready to run smoothly on any laptop!
</p>
