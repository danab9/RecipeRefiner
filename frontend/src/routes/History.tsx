import { Link } from '@tanstack/react-router'
import RecipeCard from '@/components/RecipeCard'
import Alert from '@/components/ui/Alert'
import Spinner from '@/components/ui/Spinner'
import { useHistory } from '@/hooks/useHistory'
import { useMe } from '@/hooks/useMe'

const LOGIN_LINK_CLASSES =
  'inline-flex h-11 items-center justify-center gap-2 rounded-control bg-accent px-4 font-medium text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

/** The logged-in user's saved recipe history (max 20, most recent first). */
export default function History() {
  const me = useMe()
  const history = useHistory(Boolean(me.data))

  if (!me.isPending && me.data === null) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted">Log in to see your saved recipes.</p>
        <Link to="/login" className={LOGIN_LINK_CLASSES}>
          Log in
        </Link>
      </div>
    )
  }

  if (me.isPending || (Boolean(me.data) && history.isPending)) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={32} />
      </div>
    )
  }

  if (history.isError) {
    return <Alert variant="error">Couldn’t load your history.</Alert>
  }

  const recipes = history.data ?? []

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-content">
        History ({recipes.length})
      </h1>
      {recipes.length === 0 ? (
        <p className="text-muted">No saved recipes yet.</p>
      ) : (
        <div className="space-y-6">
          {recipes.map((recipe) => (
            <RecipeCard recipe={recipe} variant="history" key={recipe.id} />
          ))}
        </div>
      )}
    </div>
  )
}
