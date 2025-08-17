# Base image with Node 20 + Debian (easy to apt-get)
FROM node:20-bookworm

# Install Python 3 and make "python" alias point to python3
RUN apt-get update \
 && apt-get install -y python3 python3-pip python-is-python3 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Install server dependencies first (better cache) ---
COPY server/package*.json ./server/
RUN cd server && npm ci

# --- Python deps ---
COPY server/python/requirements.txt ./server/python/requirements.txt
RUN pip3 install --no-cache-dir -r ./server/python/requirements.txt

# --- Copy the rest of the server code ---
COPY server ./server

# Environment
ENV NODE_ENV=production
# Do NOT hardcode PORT; Render injects PORT. Your code already respects process.env.PORT.

WORKDIR /app/server

# Helpful for stacktraces
CMD ["node", "--enable-source-maps", "src/server.js"]
