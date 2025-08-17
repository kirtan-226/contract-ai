# Node + Debian base
FROM node:20-bookworm

# --- System deps: Python 3 + venv + pip ---
RUN apt-get update \
 && apt-get install -y python3 python3-pip python3-venv python-is-python3 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Create and activate a dedicated virtualenv for Python ---
RUN python3 -m venv /opt/venv
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

# --- Install server deps (cache-friendly) ---
COPY server/package*.json ./server/
RUN cd server && npm ci

# --- Python deps (inside the venv) ---
COPY server/python/requirements.txt ./server/python/requirements.txt
RUN pip install --no-cache-dir -r ./server/python/requirements.txt

# --- App source ---
COPY server ./server

ENV NODE_ENV=production
WORKDIR /app/server

# Start (Render injects PORT)
CMD ["node", "--enable-source-maps", "src/server.js"]
