/** A refined recipe as returned by the backend. Defined once; reuse everywhere. */
export type Recipe = {
  id: number;
  title: string;
  ingredients: string[];
  instructions: string;
};

/** The current authenticated user, from `GET /api/me/`. */
export type User = {
  userId: number;
  username: string;
};
