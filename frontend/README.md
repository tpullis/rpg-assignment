# Frontend — Blog (Vue 3 + Vite)

A simple blog UI: browse users, read a user's posts (newest first), sign up / log
in, create posts, delete your own, and get a real-time banner when anyone posts.

**Stack:** Vue 3 (`<script setup>` + TypeScript), Vite, Vue Router, Apollo Client
(`@vue/apollo-composable`) over GraphQL — queries/mutations on HTTP, the
`postCreated` subscription over WebSocket (`graphql-ws`).

## Prerequisites

- Node.js `^20.19` or `>=22.12`
- The **backend running on `http://localhost:3200`** (see [`../backend/README.md`](../backend/README.md)).
  Optionally run `yarn seed` in `backend/` first to load demo users + posts.

## Quick start

```sh
yarn install
yarn dev
```

Open the printed URL (default **http://localhost:5173**). The GraphQL endpoint is
hardcoded to `localhost:3200` in [`src/apollo.ts`](./src/apollo.ts).

## Scripts

| Command | What it does |
| --- | --- |
| `yarn dev` | Start the dev server with hot reload |
| `yarn build` | Type-check and build for production into `dist/` |
| `yarn preview` | Preview the production build |
| `yarn test` | Run unit tests (Vitest) |
| `yarn type-check` | Type-check with `vue-tsc` |
| `yarn lint` | Lint and auto-fix with ESLint |

## Project layout

```
src/
  apollo.ts        Apollo client: HTTP+auth link / WebSocket split
  graphql/         GraphQL query, mutation & subscription documents
  composables/     useAuth, banner state, postCreated subscription
  components/       header, modals, cards, post item, banner
  views/           HomeView (users), UserPostsView (a user's posts)
  utils/           post sorting helper
```

> Uses **Yarn** (`yarn.lock`). Auth tokens are stored in `localStorage`;
> log in to create posts. You can only delete your own posts.
