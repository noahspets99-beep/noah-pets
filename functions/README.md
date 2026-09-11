# DEPRECATED — Firebase Cloud Functions backend

This directory is **no longer used in production**.

Payments and order APIs now run on **Vercel Serverless** via:

- `api/index.js` — Vercel entry
- `server/` — shared business logic

Do **not** run:

```bash
firebase deploy --only functions
```

## Local development

From the repo root:

```bash
npm run payments:dev
npm run dev
```

`payments:dev` starts `server/local-server.js` (same Express app as Vercel).

## Why this folder remains

Kept temporarily so you can compare the old Cloud Functions code. It is not required for Spark-plan Firebase (Auth + Firestore only) + Vercel hosting.
