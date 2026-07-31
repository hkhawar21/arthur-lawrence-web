# Arthur Lawrence Web

React (Vite) client for the Arthur Lawrence portfolio API, targeting the browser.

## Setup instructions

**Prerequisites:** Node.js, npm, and a running instance of the backend described in `docs/` (`GET/POST/PUT/DELETE /api/portfolio`, `POST /api/auth/login`) — this repo is the client only and expects that API to be reachable.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the API URL — create a `.env` file pointing at your running backend:

   ```
   VITE_API_URL=http://localhost:4000/api
   ```

   Falls back to `http://localhost:4000/api` if unset.

3. Start the app:

   ```bash
   npm run dev       # Vite dev server
   npm run build     # Production build
   npm run preview   # Preview the production build
   ```

## Login credentials

Auth hits the backend's in-memory user store (`POST /api/auth/login`). The seeded account is:

- **Email:** `admin@example.com`
- **Password:** `Password123!`

## Libraries used

| Library                                                                                         | Purpose                                                                                                             |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------|
| `react`, `react-dom`                                                                              | Core UI runtime                                                                                                     |
| `react-router-dom`                                                                                | Client-side routing (`BrowserRouter`), including the `ProtectedRoute` guard                                         |
| `zustand`                                                                                         | Global client state — auth session and the portfolio store                                                          |
| `zod`                                                                                             | Runtime validation of API request/response shapes, source of truth for portfolio/auth TypeScript types (`z.infer`) |
| `formik` + `yup`                                                                                  | Form state and validation (login form, portfolio create/edit form)                                                  |
| `vite`, `@vitejs/plugin-react`                                                                    | Dev server and build tooling                                                                                        |
| `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`    | Component/unit testing                                                                                              |
| `msw`                                                                                              | Mocking the backend API in tests, at the network layer                                                              |
| `eslint` + `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`                              | Linting                                                                                                              |
| TypeScript                                                                                         | Static typing for API/store/types layers (components remain `.jsx`)                                                 |

## Architecture decisions

- **`pages/`** holds one folder per route (`Home`, `Login`, `Portfolio/PortfolioNew`, `Portfolio/PortfolioEdit`), each a thin screen that imports its logic from `components/`, `hooks/`, `store/`, `api/`, and `types/` rather than containing it inline. `components/` mirrors this — one folder per component, colocating its `.jsx`, `.css`, and tests.
- **Zustand as the single source of truth for portfolio data** (`store/portfolio-store.ts`). Items are normalized by id (`itemsById`) so any consumer — a list row, the edit-form prefill — can read just its own slice instead of the whole list. `create`/`update`/`delete` call the API and write the result straight back into the store, so every screen reflects a mutation immediately without a manual refetch.
- **Id-only list rendering.** `Home` maps over `ids: number[]`, not the items themselves; each row (`PortfolioItemCard`, wrapped in `React.memo`) looks up its own item via a `usePortfolioItem(id)` selector. A row only re-renders when its own item changes, not on every page load.
- **Infinite scroll ("Load more") over classic pagination.** `ids` accumulates across pages; `fetchNextPage` is guarded so it's a no-op while a request is already in flight or once the last page has been reached. `fetchFirstPage` resets back to page 1 and also drives the retry button after a failed load.
- **Zod schemas are the source of truth for API types** (`types/portfolio/api.ts`, `types/auth.ts`, `types/api.ts`): request/response shapes are defined once as zod schemas and the TypeScript types are derived via `z.infer`, then every `api/*.ts` call runtime-validates the response (`schema.parse(json)`) instead of blindly trusting a cast.
- **Thin `fetch` wrapper, no data-fetching library.** `api/client.ts` is a small `fetch` wrapper (`apiRequest`) that throws a typed `ApiError` on non-2xx responses; there's no React Query/SWR layer — state lives in the Zustand store or local component state, keeping the caching/staleness story explicit rather than implicit.
- **Consistent error handling.** Every async operation follows the same shape: try the API call, on catch route the error through `getApiErrorMessage()` (`utils/apiHandler.ts`) into a dedicated `*Error` field, clear the corresponding loading flag. Failures never discard already-loaded data (e.g. a failed "load more" keeps the existing list and just shows a retry banner; a failed delete leaves the row in place).
- **Per-id loading state for concurrent operations.** Deletes track in-flight ids in a `deletingIds: number[]` array rather than one global boolean, so deleting one row doesn't disable/spin every other row.
- **Session storage abstracted behind `utils/secure-store.ts`.** The auth store persists the token/user through `getStorageItemAsync`/`setStorageItemAsync`, which wrap `localStorage` — chosen to keep the same call shape as the mobile app's `expo-secure-store` equivalent, and to fail closed (return `null`/no-op) if storage is unavailable rather than throwing.
- **Portfolio data is cleared on sign-out**, not just on unmount: `portfolio-store.ts` subscribes to `auth-store`'s status and resets to initial state on `signedOut`, so a different user signing in on the same tab never briefly sees stale data.

## Testing

`npm run test` runs the Vitest suite. Coverage focuses on the three areas most likely to break silently:

- **Form** (`components/PortfolioForm/PortfolioForm.test.jsx`) — required-field validation, invalid URL rejection, and a successful submit with trimmed values.
- **Portfolio listing** (`pages/Home/Home.test.jsx`) — empty state, a full page of items rendering, and the error state on a failed fetch (via `msw`).
- **API CRUD** (`store/portfolio-store.test.ts`) — create/update/delete success paths and failure paths, asserting the store's existing data and loading flags are left intact on error.

## Known limitations

- **`deleteError` is a single global field**, not per-item. If two deletes are ever in flight at once, a failure message could theoretically be attributed to the wrong row (unlikely in practice since delete is a deliberate one-row action, but worth knowing).
- **No i18n.** User-facing strings are hardcoded English; there's no `t()`/locale layer yet.
- **`useGetPortfolioItem` (edit-screen prefill) always fetches fresh** rather than first checking the portfolio store's cache, even if the item was already loaded from the list. This is intentional, to reflect the latest server-side data rather than a possibly-stale cached copy.
- **Session storage is `localStorage`-backed**, so it isn't available in contexts where `localStorage` is disabled (e.g. private browsing in some browsers); `secure-store.ts` fails closed in that case rather than crashing.

## What would be improved with more time

- Optimistic updates for create/update/delete instead of waiting on the round trip, with rollback on failure.
- i18n via a `t()` layer and a `locales/` catalog.
- Broader test coverage (e.g. `ProtectedRoute`, `Login`, the edit/prefill flow).
