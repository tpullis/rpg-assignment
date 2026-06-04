# API Reference

GraphQL API for users, blog posts, and real-time post notifications.

- **Endpoint:** `http://localhost:3200/graphql` (HTTP for queries/mutations)
- **Subscriptions:** same URL over WebSocket (`graphql-ws` protocol)
- **Schema:** code-first; the generated SDL lives in [`src/schema.gql`](./src/schema.gql)

## Authentication

Auth uses stateless **JWT Bearer tokens**.

1. Call `signup` or `login` to receive an `accessToken`.
2. Send it on protected operations via the header:

   ```
   Authorization: Bearer <accessToken>
   ```

Tokens are signed with `JWT_SECRET` (env var; dev fallback exists) and expire
after **1 day**. Protected operations are marked 🔒 below.

---

## Types

### User
| Field   | Type            | Notes                              |
| ------- | --------------- | ---------------------------------- |
| `id`    | `ID!`           |                                    |
| `email` | `String!`       | Unique                             |
| `posts` | `[PostModel!]`  | Posts authored by this user        |

> The password hash is **never** exposed through the API.

### PostModel
| Field      | Type      | Notes                          |
| ---------- | --------- | ------------------------------ |
| `id`       | `ID!`     |                                |
| `title`    | `String!` |                                |
| `body`     | `String!` |                                |
| `author`   | `User!`   | The user who created the post  |
| `authorId` | `ID!`     | Foreign key to `author`        |

### AuthPayload
| Field         | Type      | Notes                  |
| ------------- | --------- | ---------------------- |
| `accessToken` | `String!` | JWT, send as `Bearer`  |

### Inputs
```graphql
input CreateUserInput { email: String!  password: String! }  # email valid, password min 8 chars
input LoginInput      { email: String!  password: String! }
input CreatePostInput { title: String!  body: String! }       # both non-empty
```

---

## Mutations

### `signup(signupInput: CreateUserInput!): AuthPayload!`
Creates an account (password is bcrypt-hashed) and returns a token (auto-login).
Errors if the email is already registered.

```graphql
mutation {
  signup(signupInput: { email: "me@example.com", password: "password123" }) {
    accessToken
  }
}
```

### `login(loginInput: LoginInput!): AuthPayload!`
Verifies credentials and returns a token. Returns `Invalid credentials` (401)
for an unknown email **or** wrong password (same message, to avoid leaking which
emails exist).

```graphql
mutation {
  login(loginInput: { email: "me@example.com", password: "password123" }) {
    accessToken
  }
}
```

### 🔒 `createPost(createPostInput: CreatePostInput!): PostModel!`
Creates a post owned by the authenticated user (from the token). Requires the
`Authorization` header. Also emits a `postCreated` event to all subscribers.

```graphql
mutation {
  createPost(createPostInput: { title: "Hello", body: "My first post" }) {
    id
    title
    body
    author { id email }
  }
}
```

### `createUser(createUserInput: CreateUserInput!): User!`
Creates a user and returns the `User` (no token). Overlaps with `signup`;
prefer `signup` for the login flow.

---

## Queries

### `getUsers: [User!]!`
Returns all users.

```graphql
query {
  getUsers { id email }
}
```

### `getPostsByUser(id: Float!): [PostModel!]!`
Intended to return all posts authored by the user with the given `id`.

```graphql
query {
  getPostsByUser(id: 1) {
    id
    title
    author { id email }
  }
}
```

---

## Subscriptions

### `postCreated: PostModel!`
Pushes every newly created post to all connected clients in real time — the
backend for the "new post" notification banner. Runs over WebSocket; no auth is
required to subscribe (it is a public broadcast).

```graphql
subscription {
  postCreated {
    id
    title
    author { email }
  }
}
```

Open this subscription in one client, then run `createPost` from another — the
new post is delivered immediately, with no polling or page reload.
