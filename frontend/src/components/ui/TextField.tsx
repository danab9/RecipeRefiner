import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  /** Leading icon rendered inside the input, on the left. */
  icon?: ReactNode;
  /** Trailing node rendered inside the input, on the right (e.g. a show/hide toggle). */
  trailing?: ReactNode;
};

/**
 * Labeled text input with optional leading icon, trailing node, and inline
 * error message. Forwards its ref so React Hook Form's `register` works.
 */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, icon, trailing, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-content">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`h-11 w-full rounded-control border bg-surface text-content placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
              icon ? "pl-10" : "pl-3"
            } ${trailing ? "pr-10" : "pr-3"} ${
              error ? "border-danger" : "border-line"
            } ${className}`}
            {...rest}
          />
          {trailing && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              {trailing}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";

export default TextField;
