/** Centralized, typed query keys so reads and invalidations never drift. */
export const queryKeys = {
  me: ["me"] as const,
  history: ["history"] as const,
};
