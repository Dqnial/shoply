/** @type {import('next').NextConfig} */
// Plain .js, not .ts: the unified server (backend/src/server.ts) loads this
// config at runtime via next()'s programmatic API. A .ts config needs the
// "typescript" package present to transpile — which the production image
// deliberately doesn't install (a devDependency, omitted via `npm ci
// --omit=dev`) — so .ts would crash the app on boot with "Cannot find
// module 'typescript'".
const nextConfig = {
  // No "output: standalone" — the app runs behind a custom Express server,
  // not the minimal server.js standalone mode generates.
  //
  // No images.remotePatterns either: image URLs are same-origin relative
  // paths ("/uploads/...", see lib/axios.ts's API_URL), and remotePatterns
  // only restricts absolute cross-origin image URLs.
};

module.exports = nextConfig;
