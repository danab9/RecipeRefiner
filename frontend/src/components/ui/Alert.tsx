import { CircleAlert, CircleCheck, X } from "lucide-react";
import type { ReactNode } from "react";

type AlertVariant = "error" | "success";

type AlertProps = {
  variant: AlertVariant;
  children: ReactNode;
  onClose?: () => void;
};

const variantClasses: Record<AlertVariant, string> = {
  error: "bg-danger/10 text-danger",
  success: "bg-accent/10 text-accent",
};

const variantIcon: Record<AlertVariant, typeof CircleAlert> = {
  error: CircleAlert,
  success: CircleCheck,
};

/** Tonal inline alert for surfacing errors or success feedback. */
export default function Alert({ variant, children, onClose }: AlertProps) {
  const Icon = variantIcon[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-control p-3 text-sm ${variantClasses[variant]}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded-control p-1 hover:bg-content/10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
