# Use lightweight Python 3.11 image
FROM python:3.11-slim

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (needed for some Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (leverages Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose Django REST port
EXPOSE 8000

# Run migrations, seed data, then start Gunicorn via entrypoint
ENTRYPOINT ["sh", "entrypoint.sh"]
