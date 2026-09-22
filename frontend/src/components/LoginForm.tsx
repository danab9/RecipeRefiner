import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Alert from "@/components/ui/Alert";
import { useLogin } from "@/hooks/useLogin";
import { loginSchema } from "@/schemas/auth";
import type { LoginValues } from "@/schemas/auth";

type LoginFormProps = {
  onSwitchToSignUp: () => void;
};

const FALLBACK_ERROR_MESSAGE = "Unable to log in. Please try again.";

/** Login form: username + password, wired to the login mutation. */
export default function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setSubmitError(null);
    try {
      await mutateAsync(values);
      void navigate({ to: "/" });
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data?.error ?? FALLBACK_ERROR_MESSAGE)
        : FALLBACK_ERROR_MESSAGE;
      setSubmitError(message);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-sm sm:p-8">
      <h1 className="mb-6 text-center text-2xl font-semibold text-content">
        Log in
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
          {...register("username")}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          icon={<Lock size={18} aria-hidden="true" />}
          trailing={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 border-none p-0"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
          autoComplete="current-password"
          {...register("password")}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isPending}
        >
          Log in
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm">
        <span className="text-muted">Don&rsquo;t have an account?</span>
        <Button variant="ghost" size="sm" onClick={onSwitchToSignUp}>
          Sign up
        </Button>
      </div>
    </div>
  );
}
