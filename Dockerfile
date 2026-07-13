# ---- Stage 1: build the Vue frontend ----
FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build   # outputs to /app/frontend/dist

# ---- Stage 2: Django backend ----
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1
# Set work directory
WORKDIR /app

# Upgrade pip and setuptools to latest
RUN pip install --upgrade pip setuptools

# Install Python dependencies first for better caching
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        git \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . /app/

# Bring in the built frontend from stage 1
COPY --from=frontend /app/frontend/dist /app/frontend/dist

# Collect static files (Vue build + Django) for WhiteNoise to serve
RUN python manage.py collectstatic --noinput

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run migrations, then start the production server.
# Render provides $PORT; default to 8000 for local runs.
CMD ["sh", "-c", "python manage.py migrate && gunicorn reciperefiner.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
