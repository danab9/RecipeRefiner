import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SignUpForm from "@/components/SignUpForm";

type AuthMode = "login" | "signup";

/** Login/sign-up route: toggles between the two forms without a URL change. */
export default function Login() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="flex justify-center py-8">
      {mode === "login" ? (
        <LoginForm onSwitchToSignUp={() => setMode("signup")} />
      ) : (
        <SignUpForm onSwitchToLogin={() => setMode("login")} />
      )}
    </div>
  );
}
