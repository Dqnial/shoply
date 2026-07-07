# Single image for the unified server: Express (backend) hosts Next.js
# (frontend) via a custom server (backend/src/server.ts) — one process, one
# port, no separate frontend container. See docker-compose.yml.

# --- deps: install each project's own deps (separate lockfiles) ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

# --- build: compile the backend, build the frontend ---
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY backend ./backend
COPY frontend ./frontend
RUN cd backend && npm run build
RUN cd frontend && npm run build

# --- runtime: production deps only + compiled/build output ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev
COPY --from=build /app/backend/dist ./backend/dist
# Seed images (product photos, default avatar) committed to the repo — not
# just an empty dir, or every /uploads/* request 404s until someone uploads
# a replacement through the admin panel.
COPY --from=build /app/backend/uploads ./backend/uploads

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci --omit=dev
COPY --from=build /app/frontend/.next ./frontend/.next
COPY --from=build /app/frontend/public ./frontend/public
COPY --from=build /app/frontend/next.config.js ./frontend/next.config.js

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "dist/server.js"]
