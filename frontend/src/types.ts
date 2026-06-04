// GraphQL `ID` scalars arrive as strings in Apollo's normalized cache.
export interface Author {
  id: string
  email: string
}

export interface Post {
  id: string
  title: string
  body: string
  author: Author
}

export interface User {
  id: string
  email: string
  posts?: { id: string }[]
}
