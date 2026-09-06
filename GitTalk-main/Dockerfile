FROM python:3.11-slim

# Install system dependencies, Git, and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Install Python dependencies
COPY app/requirements.txt ./app/requirements.txt
RUN pip install --no-cache-dir -r ./app/requirements.txt

# 2. Install Node.js dependencies (Backend & Frontend)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY Frontend/package*.json ./Frontend/
RUN cd Frontend && npm ci

# 3. Copy application code
COPY . .

# 4. Build Frontend static files
RUN cd Frontend && npm run build

# Make start script executable
RUN chmod +x ./start.sh

# Expose default port (Railway will override PORT at runtime)
EXPOSE 5000

ENV NODE_ENV=production

CMD ["/bin/bash", "./start.sh"]
