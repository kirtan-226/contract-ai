# ---- Base image with Node + Python ----
FROM node:20-bookworm

# Install Python3 + pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Install backend deps first (better caching) ---
COPY server/package*.json ./server/
RUN cd server && npm ci

# --- Install Python deps ---
COPY server/python/requirements.txt ./server/python/requirements.txt
RUN pip3 install --no-cache-dir -r ./server/python/requirements.txt

# --- Copy all backend code ---
COPY server ./server

# Environment setup
ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app/server

# Expose API port
EXPOSE 8080

# Start API
CMD ["node", "src/server.js"]
