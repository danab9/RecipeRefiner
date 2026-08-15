import { Loader2 } from "lucide-react";

type SpinnerProps = {
  /** Icon size in pixels. Defaults to 20. */
  size?: number;
  className?: string;
};

/** A small inline loading indicator; announces itself to assistive tech. */
export default function Spinner({ size = 20, className = "" }: SpinnerProps) {
  return (
    <span role="status" className={`inline-flex items-center ${className}`}>
      <Loader2 size={size} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </span>
  );
}
