/** The Privacy Policy page. Doubles as the policy URL for the Chrome Web Store listing. */
export default function PrivacyPolicy() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-content">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted">Last updated: 2026-10-09</p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Summary</h2>
        <p className="text-muted">
          Recipe Refiner does not sell or share your personal data, and uses no analytics,
          advertising, or tracking of any kind. The browser extension needs no account: it
          sends the web address (URL) of the tab you are viewing to our server only when you
          click one of its buttons. If you create an account on the website, we store the
          account details and recipe history described below so the site can show them back
          to you.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">The browser extension</h2>
        <p className="text-muted">
          When you open the extension, it uses the{' '}
          <code className="text-content">activeTab</code> permission to read the URL of the
          tab you are currently viewing. It checks that URL against a built-in list of
          supported recipe sites on your device; nothing is sent at this point. It does not
          read the page's content, your browsing history, or other tabs.
        </p>
        <p className="text-muted">The URL leaves your device only when you click:</p>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>
            <strong className="text-content">Quick refine</strong> — the URL is sent to our
            server at <code className="text-content">reciperefiner.onrender.com</code>, which
            returns a clean, ad-free version of that recipe. This request is anonymous: the
            extension sends no cookies and nothing is saved to any account.
          </li>
          <li>
            <strong className="text-content">Open in new page</strong> — the extension opens
            the Recipe Refiner website in a new tab with the URL filled in. From then on, the
            website section below applies.
          </li>
        </ul>
        <p className="text-muted">
          The extension sets no cookies and stores nothing on your device.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">The website</h2>
        <p className="text-muted">
          You can use the website without an account. In that case the recipe URL you submit
          is used only to fetch and return the cleaned recipe, and is not saved.
        </p>
        <p className="text-muted">If you register, we store:</p>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>your username;</li>
          <li>your password, stored only as a secure one-way hash, never in plain text;</li>
          <li>your email address, if you choose to give one;</li>
          <li>
            your last 20 refined recipes: the recipe URL, title, ingredients, and
            instructions, including any edits you make. Older recipes are deleted
            automatically.
          </li>
        </ul>
        <p className="text-muted">
          You can delete any saved recipe from your history at any time. To delete your
          account and all its data, email us at an address below.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Cookies and local storage</h2>
        <p className="text-muted">
          The website uses only strictly necessary cookies: a session cookie that keeps you
          logged in, and a security (CSRF) cookie that protects your account from forged
          requests. It also saves your light/dark theme choice in your browser's local
          storage. There are no advertising or analytics cookies.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Third-party services</h2>
        <p className="text-muted">
          We use these providers to run Recipe Refiner. They process data only to provide
          their service to us:
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>
            <strong className="text-content">Render</strong> hosts our server. Like any web
            host, it may keep standard request logs, such as IP addresses.
          </li>
          <li>
            <strong className="text-content">Neon</strong> hosts our database, where account
            data and recipe history are stored.
          </li>
        </ul>
        <p className="text-muted">
          To refine a recipe, our server fetches the recipe page from the site it belongs to.
          That site sees a request from our server, not from you.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">What we do not do</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>We do not sell or share your data with third parties.</li>
          <li>We do not use advertising networks, analytics, or cross-site tracking.</li>
          <li>We do not collect financial, health, or location data.</li>
          <li>We do not use your data to determine creditworthiness or for lending.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-content">Permissions we request</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>
            <code className="text-content">activeTab</code> — to read the URL of the tab you
            are viewing when you open the extension.
          </li>
          <li>
            <code className="text-content">host_permissions</code> for{' '}
            <code className="text-content">reciperefiner.onrender.com</code> — to send that URL
            to our server and receive the cleaned recipe.
          </li>
        </ul>
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
          Questions about this policy, or want your account deleted? Email{' '}
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
