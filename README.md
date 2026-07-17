# Euclid's Elements reader

A searchable, responsive reader for Thomas L. Heath's translation of Euclid's
*Elements*. All thirteen books are included. Every proposition has a restrained
interactive construction tied to its geometric or numerical proof family.

## Run locally

```bash
npm install
npm run dev
```

Validate the production bundle and rendered output:

```bash
npm test
```

## Deploy

The production site is a static export deployed as a Cloudflare Worker. The
public GitHub repository runs lint and tests on every pull request and push.
Cloudflare Workers Builds deploys successful pushes to `main` from the connected
GitHub repository. Non-production branch builds publish pull requests as Worker
versions without promoting them to production. Cloudflare comments both a
commit-specific URL and a stable branch preview URL on each pull request.

The Worker is named `euclid`; `wrangler.jsonc` contains the public deployment
configuration. Run `npm run deploy` for an authorized manual deployment.
Preview URLs are explicitly enabled in that file; non-production branch builds
and the `npx wrangler versions upload` preview command are configured in the
Worker's Cloudflare dashboard under **Settings > Build**.

The canonical production URL is <https://explore-euclid.online>. Cloudflare
attaches that custom domain directly to the `euclid` Worker and manages its TLS
certificate. Zone-level settings enforce HTTPS, while a proxied `www` DNS
record and an active 301 Redirect Rule send `www.explore-euclid.online` to the
canonical hostname while preserving paths and query strings. Those zone-level
DNS, redirect, and HTTPS settings live in the Cloudflare dashboard rather than
`wrangler.jsonc` and must be recreated if the zone is replaced.

## Import another book

The importer accepts every book in the *Elements* and preserves the source's
section hierarchy, inline cross-references, and Heath's notes.

```bash
python3 scripts/extract_perseus_book.py --book 2 --output app/data/book-2.json
```

Refresh all thirteen books with one source download:

```bash
python3 scripts/extract_perseus_book.py --all
```

The page-level registry in `app/page.tsx` loads the generated book files.

## License

The reader's original code is available under the [MIT License](LICENSE).
Thomas L. Heath's translated text and the Perseus source material retain their
respective source licenses and are not relicensed by the MIT License.

## Source and reuse

The text comes from the [Perseus Digital Library](https://www.perseus.tufts.edu/hopper/text?doc=Euc.+1):

> Text provided by Perseus Digital Library, with funding from The National
> Science Foundation.

Perseus displays the work under the
[Creative Commons Attribution-ShareAlike 3.0 United States license](https://creativecommons.org/licenses/by-sa/3.0/us/).
Its TEI download also includes an availability statement requesting Perseus
credit, noncommercial use, retention of that statement, and that modifications
be offered back to Perseus. The reader keeps the source text separate from the
interface and includes the attribution in the product.
