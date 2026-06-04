import gql from 'graphql-tag'

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      email
      posts {
        id
      }
    }
  }
`

export const GET_POSTS_BY_USER = gql`
  query GetPostsByUser($id: Float!) {
    getPostsByUser(id: $id) {
      id
      title
      body
      author {
        id
        email
      }
    }
  }
`

export const LOGIN = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
    }
  }
`

export const SIGNUP = gql`
  mutation Signup($signupInput: CreateUserInput!) {
    signup(signupInput: $signupInput) {
      accessToken
    }
  }
`

export const CREATE_POST = gql`
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      id
      title
      body
      author {
        id
        email
      }
    }
  }
`

// NOTE: `deletePost` is NOT implemented on the backend yet — wired as if it
// exists per the spec. It assumes a scalar return (e.g. Boolean!). If the future
// resolver returns an object type, add a selection set here.
export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`

export const POST_CREATED = gql`
  subscription PostCreated {
    postCreated {
      id
      title
      body
      author {
        id
        email
      }
    }
  }
`
