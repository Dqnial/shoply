// Explicit ambient declaration for plain CSS side-effect imports
// (e.g. `import "./globals.css"` in app/layout.tsx).
//
// Next.js's own TypeScript plugin (see the "next" entry under
// compilerOptions.plugins in tsconfig.json) normally teaches the editor's
// language service how to resolve these — but that plugin only runs inside
// an editor's TS server, never in the `tsc` CLI or the Next.js build itself,
// so its absence/failure to load never breaks an actual build. This
// declaration makes the IDE recognize CSS imports directly, independent of
// whether that plugin is loaded correctly in a given setup.
declare module "*.css";
