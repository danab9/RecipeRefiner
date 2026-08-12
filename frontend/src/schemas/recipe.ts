import { z } from 'zod'

/** The Home form: a single URL that must be a valid http(s) address. */
export const urlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Please enter a URL')
    .refine((value) => {
      try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    }, 'Enter a valid http(s) URL'),
})

export type UrlValues = z.infer<typeof urlSchema>
