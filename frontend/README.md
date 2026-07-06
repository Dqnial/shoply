# Shoply — Frontend

Next.js (App Router) client for Shoply. See the [root README](../README.md) for the full project overview, screenshots, security highlights, and setup instructions.

## Local development

This project doesn't run standalone in the normal workflow — the unified server in [`../backend`](../backend) (`npm run dev` there) hosts this frontend internally via a custom Express+Next.js server (see the root README's Architecture section), all on one port.

```bash
npm install
```

is all that's needed here; then run everything from `../backend`.

Running `npm run dev` directly in this folder starts a bare Next.js dev server with no API behind it — pages that fetch data (catalog, cart, admin, etc.) won't work. Only useful for isolated UI/styling work on a component that doesn't need live data.
