# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install Python dependencies first for better caching
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and setuptools to latest
RUN pip install --upgrade pip setuptools

# Copy project files
COPY . /app/

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 8000

# # Run the development server - now in docker-compose.yml
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]