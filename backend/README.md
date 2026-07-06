# Shoply — Backend

Express + TypeScript API for Shoply. See the [root README](../README.md) for the full project overview, security highlights, and setup instructions.

## Local development

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI and JWT_SECRET
npm run dev
```

Runs at [http://localhost:5000](http://localhost:5000) — `npm run dev` here starts the **unified server** (`src/server.ts`), which serves the frontend too (see the root README's Architecture section). No separate frontend process needed; `frontend/` only needs `npm install` run once so its build output/`node_modules` are available.

## Testing

```bash
npm test
```

Runs Vitest + Supertest integration tests against a real in-memory MongoDB replica set.
