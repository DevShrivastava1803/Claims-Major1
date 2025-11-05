# syntax=docker/dockerfile:1.5
FROM python:3.10-slim

# Environment optimizations
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies (prefer wheels to avoid slow source builds)
RUN --mount=type=cache,target=/root/.cache/pip pip install --prefer-binary -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories for persistent data
RUN mkdir -p uploads vector_db/chroma reports

# Expose the dynamic port used by Render (defaults to 8000 for local runs)
ENV PORT=8000
EXPOSE $PORT

# Start the FastAPI server using Render's assigned port
# The ${PORT} variable ensures compatibility with Render's environment
CMD ["bash", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
