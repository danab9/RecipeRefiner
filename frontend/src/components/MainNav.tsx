import { ClipboardList, UtensilsCrossed } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import ThemeToggle from "@/components/ThemeToggle";
import { useMe } from "@/hooks/useMe";
import { useHistory } from "@/hooks/useHistory";
import { useLogout } from "@/hooks/useLogout";

/** Sticky top navigation: brand, history link with a saved-count badge, theme toggle, and auth area. */
export default function MainNav() {
  const me = useMe();
  const history = useHistory(Boolean(me.data));
  const logout = useLogout();
  const navigate = useNavigate();

  const historyCount = history.data?.length;

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
    });
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 font-semibold text-content"
          >
            <UtensilsCrossed
              size={20}
              className="text-accent"
              aria-hidden="true"
            />
            Recipe Refiner
          </Link>
          {me.data && (
            <Link
              to="/history"
              className="inline-flex h-9 items-center gap-1.5 rounded-control px-3 text-content hover:bg-content/5"
            >
              <ClipboardList size={18} aria-hidden="true" />
              <span className="hidden sm:inline">History</span>
              {Boolean(historyCount) && (
                <span className="rounded-control bg-accent px-1.5 text-xs text-on-accent">
                  {historyCount}
                </span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {me.isPending ? (
            <Spinner size={20} />
          ) : me.data ? (
            <>
              <span className="hidden text-sm text-muted sm:inline">
                Hello {me.data.username}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-control bg-accent px-3 text-sm font-medium text-on-accent hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
