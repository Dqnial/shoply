# Shoply — Backend

Express + TypeScript API for Shoply. See the [root README](../README.md) for the full project overview, security highlights, and setup instructions.

## Local development

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI and JWT_SECRET
npm run dev
```

Runs at [http://localhost:5000](http://localhost:5000). Requires the frontend running (see [`../frontend`](../frontend)) to use the app end-to-end.

## Testing

```bash
npm test
```

Runs Vitest + Supertest integration tests against a real in-memory MongoDB replica set.
