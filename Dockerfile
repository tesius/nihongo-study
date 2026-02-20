FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

# Install all dependencies
RUN npm install

# Copy source code
COPY frontend/ frontend/
COPY backend/ backend/

# Build frontend
RUN npm run build --workspace=frontend

# Build backend
RUN npm run build --workspace=backend

# Keep curriculum.md as fallback (volume mount may be empty on first deploy)
RUN cp backend/data/curriculum.md /app/curriculum.md.default

# Startup script: copy curriculum if missing, then start
RUN echo '#!/bin/sh\n\
mkdir -p /app/backend/data/generated\n\
[ ! -f /app/backend/data/curriculum.md ] && cp /app/curriculum.md.default /app/backend/data/curriculum.md\n\
exec node backend/dist/index.js' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3001

CMD ["/app/start.sh"]
