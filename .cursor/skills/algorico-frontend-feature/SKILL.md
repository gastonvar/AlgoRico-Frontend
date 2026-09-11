---
name: algorico-frontend-feature
description: Implements AlgoRico frontend features using React, Vite, TypeScript, TanStack Query, Axios, Zod, React Hook Form, Tailwind, and shadcn/ui with Bulletproof React feature boundaries. Use when adding or changing frontend routes, screens, forms, API integrations, query hooks, or shared UI in src.
---

# AlgoRico Frontend Feature

## Workflow

1. Inspect the nearest existing feature under `src/features` and follow its folder shape before adding files. Create only the subfolders that feature needs.
2. Build in this order: types/Zod schemas → API fetcher → TanStack Query hook → UI components → route → tests for the workflow.
3. Respect unidirectional flow: shared → features → app. Do not import other features; compose in `src/app`.
4. Place app setup in `src/app`, shared primitives in `src/components`, shared helpers in `src/lib`, and domain models in `src/types`.
5. For a feature domain, keep HTTP functions in `features/<domain>/api`, query and mutation hooks in `features/<domain>/hooks`, route components in `features/<domain>/routes`, and local schemas/types in `schemas` or `types`.
6. Use `apiClient` from `src/lib/api-client.ts`; do not create a separate Axios client or hardcode backend URLs.
7. Use TanStack Query key factories near the hooks, gate queries with `enabled` when inputs are missing, and invalidate all affected keys after mutations. Server data stays in Query, not Zustand.
8. Use Zod plus `react-hook-form` for forms and show field errors through existing form primitives.
9. Build UI with shadcn/ui and existing primitives first. Extract nested render helpers into components. Prefer composition over long prop lists.
10. Keep user-facing copy in Spanish and preserve accessible labels, button types, semantic roles, and responsive Tailwind behavior.
11. Respect auth conventions: session stays centralized, refresh is handled by `api-client`, and permission failures should render clear `403` states.
12. Before finishing substantive work, run applicable commands from this package: `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.

## Common File Pattern

```text
src/features/<domain>/
  api/<domain>-api.ts
  hooks/use-<domain>.ts
  routes/<domain>-route.tsx
  components/<domain>-*.tsx
  schemas/<domain>-schemas.ts
  types/<domain>-types.ts
```
