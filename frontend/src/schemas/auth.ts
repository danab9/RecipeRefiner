import { z } from 'zod'

// Runtime guards for the auth forms. Kept aligned with the compile-time
// `LoginPayload` / `RegisterPayload` types in `@/types/auth`.

const username = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores',
  )

const password = z.string().min(3, 'Password must be at least 3 characters')

export const loginSchema = z.object({
  username,
  password,
})

export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    username,
    // Optional email: empty string is allowed, otherwise must be a valid email.
    email: z
      .union([z.literal(''), z.email('Enter a valid email')])
      .optional(),
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterValues = z.infer<typeof registerSchema>
