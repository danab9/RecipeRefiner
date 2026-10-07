/**
 * Request payloads for the auth endpoints. These are the compile-time contract;
 * the Zod schemas in `@/schemas/auth` are the runtime guard and must describe the
 * same shape.
 */
export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  email?: string;
};
