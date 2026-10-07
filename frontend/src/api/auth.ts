import api from "@/lib/axios";
import type { LoginPayload, RegisterPayload } from "@/types/auth";
import type { User } from "@/types/recipe";

/** Backend shape for the current user; mapped to the camelCase `User` type. */
type UserResponse = {
  user_id: number;
  username: string;
};

function toUser(data: UserResponse): User {
  return { userId: data.user_id, username: data.username };
}

/**
 * Current user from the session cookie. Throws (401) when logged out — callers
 * (see `useMe`) translate that rejection into a logged-out `null`.
 */
export async function getMe(): Promise<User> {
  const { data } = await api.get<UserResponse>("/me/");
  return toUser(data);
}

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<UserResponse>("/login/", payload);
  return toUser(data);
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<UserResponse>("/register/", payload);
  return toUser(data);
}

export async function logout(): Promise<void> {
  await api.post("/logout/", {});
}
