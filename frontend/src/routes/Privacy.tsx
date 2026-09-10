/** The Privacy Policy page. Doubles as the policy URL for the Chrome Web Store listing. */
export default function PrivacyPolicy() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-content">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted">Last updated: 2026-09-10</p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Summary</h2>
        <p className="text-muted">
          Recipe Refiner does not collect, store, sell, or share your personal data. You do
          not need an account to use the browser extension. The extension sets no cookies and
          uses no analytics or tracking of any kind.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">What the extension accesses</h2>
        <p className="text-muted">
          Using the <code className="text-content">activeTab</code> permission, the extension
          reads only the web address (URL) of the tab you are currently viewing, and only at
          the moment you click <strong className="text-content">Refine</strong>. It does not
          read your browsing history, other tabs, or any personal information.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">How that data is used</h2>
        <p className="text-muted">
          When you click Refine, the page URL is sent to our server at{' '}
          <code className="text-content">reciperefiner.onrender.com</code> for the sole purpose
          of fetching a clean, ad-free version of that recipe, which is then returned to you.
          The URL is used only to fulfil your request. It is not retained for profiling,
          advertising, or any purpose unrelated to that single action.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">What we do not do</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>We do not sell or share your data with third parties.</li>
          <li>We do not use advertising networks or cross-site tracking.</li>
          <li>
            We do not collect personal, financial, health, location, or authentication data.
          </li>
          <li>We do not use your data to determine creditworthiness or for lending.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Permissions we request</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>
            <code className="text-content">activeTab</code> — to read the URL of the tab you
            are viewing when you click Refine.
          </li>
          <li>
            <code className="text-content">host_permissions</code> for{' '}
            <code className="text-content">reciperefiner.onrender.com</code> — to send that URL
            to our server and receive the cleaned recipe.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Third-party services</h2>
        <p className="text-muted">
          The only external service the extension contacts is our own Recipe Refiner server,
          and only to process the recipe you asked to refine. No other third-party services
          receive your data.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Children's privacy</h2>
        <p className="text-muted">
          Recipe Refiner is not directed at children and does not knowingly collect any data
          from children.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Changes to this policy</h2>
        <p className="text-muted">
          If our data practices change, we will update this page and revise the "Last updated"
          date above.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Contact</h2>
        <p className="text-muted">
          Questions about this policy? Email{' '}
          <a
            href="mailto:idomand@gmail.com"
            className="rounded-control text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            idomand@gmail.com
          </a>{' '}
          or{' '}
          <a
            href="mailto:danabr93@gmail.com"
            className="rounded-control text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            danabr93@gmail.com
          </a>
          .
        </p>
      </section>
    </article>
  )
}
