FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY frontend/ frontend/
COPY backend/ backend/

# Build frontend
RUN pnpm --filter ./frontend build

# Build backend
RUN pnpm --filter ./backend build

# Keep curriculum.md as fallback (volume mount may be empty on first deploy)
RUN cp backend/data/curriculum.md /app/curriculum.md.default

# Startup script: copy curriculum if missing, then start
RUN echo '#!/bin/sh\n\
mkdir -p /app/backend/data/generated\n\
[ ! -f /app/backend/data/curriculum.md ] && cp /app/curriculum.md.default /app/backend/data/curriculum.md\n\
exec node backend/dist/index.js' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3001

CMD ["/app/start.sh"]
