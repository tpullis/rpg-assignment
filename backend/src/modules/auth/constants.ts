// In a real deployment this MUST come from a secret manager / env var and never
// be committed. The dev fallback keeps local setup friction-free.
export const jwtConstants = {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  expiresIn: '1d',
} as const;
