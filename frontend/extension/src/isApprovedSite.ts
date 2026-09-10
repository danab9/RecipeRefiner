import approvedSites from './approvedSites.json'

// Built once at module load. Membership checks are O(1) against this Set.
const APPROVED = new Set<string>(approvedSites)

/**
 * True when the given URL's host — or any of its parent domains — is in the
 * approved-sites list (the sites RecipeRefiner's scraper supports).
 *
 * Matches by walking parent domains against the Set rather than using
 * `endsWith`, so `www.allrecipes.com` -> `allrecipes.com` and
 * `www.bbc.co.uk` -> `bbc.co.uk` both match, subdomain-only entries like
 * `cooking.nytimes.com` are honored, and lookalikes such as
 * `notallrecipes.com` do NOT match. The bare TLD is never checked.
 */
export function isApprovedSite(url: string | null | undefined): boolean {
  if (!url) {
    return false
  }
  let host: string
  try {
    host = new URL(url).hostname.toLowerCase()
  } catch {
    // Not a parseable URL (e.g. a chrome:// page or an empty tab).
    return false
  }
  const parts = host.split('.')
  // Check the full host, then each parent domain, stopping before the bare TLD.
  for (let index = 0; index < parts.length - 1; index += 1) {
    if (APPROVED.has(parts.slice(index).join('.'))) {
      return true
    }
  }
  return false
}
