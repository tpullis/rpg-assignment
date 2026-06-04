# Backend — Blog API (NestJS + GraphQL)

A GraphQL API for user auth, blog posts, and real-time "new post" notifications.
See [`API.md`](./API.md) for the full API reference.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL running locally
- (Optional) Redis — only needed for multi-instance real-time notifications

## 1. Database setup

Create the database (PostgreSQL must be running):

```bash
createdb -h localhost rpg_assignment
```

The connection settings live in [`src/app.module.ts`](./src/app.module.ts):

| Setting  | Default          |
| -------- | ---------------- |
| host     | `localhost`      |
| port     | `5432`           |
| username | `pullist`        |
| password | `` (empty)       |
| database | `rpg_assignment` |

Edit those to match your local Postgres, or create a matching role. Tables are
created automatically on startup (`synchronize: true`), so no migrations needed.

## 2. Install & run

```bash
npm install
npm run start:dev
```

GraphQL endpoint + sandbox: **http://localhost:3200/graphql**

## 3. Tests

```bash
npm test
```

## 4. Example request

Create an account and get a token (paste into the GraphQL sandbox):

```graphql
mutation {
  signup(signupInput: { email: "me@example.com", password: "password123" }) {
    accessToken
  }
}
```

Then create a post — add the token as a header in the sandbox first:

```json
{ "Authorization": "Bearer <accessToken-from-signup>" }
```

```graphql
mutation {
  createPost(createPostInput: { title: "Hello", body: "My first post" }) {
    id
    title
    author { id email }
  }
}
```

Delete a post (same `Authorization` header). Returns `true` on success; you can
only delete your **own** posts — deleting another user's post returns a
`Forbidden` error, and an unknown id returns `Not Found`:

```graphql
mutation {
  deletePost(id: 1)
}
```

## Real-time notifications (optional Redis)

By default the app uses an in-memory event bus — real-time `postCreated`
subscriptions work out of the box on a single instance.

To fan out across multiple instances, run Redis and set `REDIS_HOST`:

```bash
brew install redis && brew services start redis   # or: docker run -d -p 6379:6379 redis
REDIS_HOST=localhost npm run start:dev
```
