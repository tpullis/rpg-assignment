// Import from the React-free `/core` entry: the bare `@apollo/client` entry
// bundles the React integration (via `rehackt`), which fails to resolve `react`
// in this Vue app and crashes Vite's dev bundler. `@vue/apollo-composable` also
// imports from `/core`.
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { getToken } from './composables/useAuth'

const HTTP_URL = 'http://localhost:3200/graphql'
const WS_URL = 'ws://localhost:3200/graphql'

const httpLink = new HttpLink({ uri: HTTP_URL })

// Attach the Bearer token (when present) on every HTTP operation.
const authLink = setContext((_, { headers }) => {
  const token = getToken()
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

const wsLink = new GraphQLWsLink(createClient({ url: WS_URL }))

// Subscriptions go over WebSocket; everything else over authenticated HTTP.
const link = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink),
)

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})
