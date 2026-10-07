import { Code } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const REPOSITORY_URL = 'https://github.com/danab9/RecipeRefiner'

/** Site-wide footer: privacy policy link, external codebase link, and brand line. */
export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface text-muted">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-6 text-sm sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Recipe Refiner</p>

        <nav className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="rounded-control hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Privacy Policy
          </Link>
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-control hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Code size={16} aria-hidden="true" />
            Code on GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
