import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import Alert from '@/components/ui/Alert'
import { useRegister } from '@/hooks/useRegister'
import { registerSchema } from '@/schemas/auth'
import type { RegisterValues } from '@/schemas/auth'
import type { RegisterPayload } from '@/types/auth'

type SignUpFormProps = {
  onSwitchToLogin: () => void
}

const FALLBACK_ERROR_MESSAGE = 'Unable to sign up. Please try again.'

/** Sign-up form: username, optional email, password + confirmation. */
export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(values: RegisterValues) {
    setSubmitError(null)
    const payload: RegisterPayload = {
      username: values.username,
      password: values.password,
      email: values.email || undefined,
    }
    try {
      await mutateAsync(payload)
      void navigate({ to: '/' })
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.error ?? FALLBACK_ERROR_MESSAGE)
        : FALLBACK_ERROR_MESSAGE
      setSubmitError(message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="mb-6 text-center text-2xl font-semibold text-content">
        Create account
      </h1>

      <form
        onSubmit={(event) => void handleSubmit(onSubmit)(event)}
        noValidate
        className="flex flex-col gap-4"
      >
        {submitError && (
          <Alert variant="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        <TextField
          label="Username"
          icon={<User size={18} aria-hidden="true" />}
          error={errors.username?.message}
          autoComplete="username"
          {...register('username')}
        />

        <TextField
          label="Email (optional)"
          type="email"
          icon={<Mail size={18} aria-hidden="true" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          icon={<Lock size={18} aria-hidden="true" />}
          trailing={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 border-none p-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </Button>
          }
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        <TextField
          label="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          icon={<Lock size={18} aria-hidden="true" />}
          trailing={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 border-none p-0"
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
              onClick={() => setShowConfirmPassword((current) => !current)}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </Button>
          }
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isPending}
        >
          Sign up
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm">
        <span className="text-muted">Already have an account?</span>
        <Button variant="ghost" size="sm" onClick={onSwitchToLogin}>
          Log in
        </Button>
      </div>
    </div>
  )
}
