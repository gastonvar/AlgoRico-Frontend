---
name: algorico-frontend-review
description: Reviews AlgoRico frontend changes for Bulletproof architecture fit, auth safety, API/query correctness, forms, permissions, accessibility, UI states, and verification. Use when reviewing frontend changes, pull requests, diffs, or asking whether frontend work is ready.
---

# AlgoRico Frontend Review

## Review Focus

Lead with correctness issues and user-facing regressions. Check frontend changes against these expectations:

- Feature code belongs under `src/features/<domain>` with API calls, hooks, routes, schemas, types, and components separated like nearby domains.
- Backend calls use `apiClient`, `VITE_API_URL`, and typed API helpers; no hardcoded hosts or duplicate Axios setup.
- Tokens are never logged or rendered, and session storage remains centralized.
- Refresh behavior, logout behavior, query clearing, and redirects preserve the existing session lifecycle.
- TanStack Query hooks use stable keys, correct `enabled` guards, and mutation invalidation for all stale screens.
- Forms use Zod and `react-hook-form`, show backend and field errors clearly, and handle `401`, `403`, `404`, and `409` responses.
- Frontend role checks are UX only; render graceful forbidden states for inaccessible sections.
- Screens include loading, empty, error, and success feedback where users would otherwise be stuck.
- UI uses shadcn/ui, existing primitives, and Tailwind; preserves Spanish copy; keeps controls accessible and mobile-first.
- Prefer `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` from this package when practical.

## Response Style

For reviews, list findings first by severity with file references. If there are no blocking issues, say so clearly and mention any verification gaps.
