# Euclid's Elements reader

A searchable, responsive reader for Thomas L. Heath's translation of Euclid's
*Elements*. Book I is complete; the navigation and data model already account
for Books II-XIII.

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
GitHub Actions deploys successful pushes to `main` using Cloudflare credentials
stored only as encrypted repository secrets.

The workflow expects these GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`: an account-scoped token with only Workers Scripts Edit
- `CLOUDFLARE_ACCOUNT_ID`: the target Cloudflare account ID

The Worker is named `euclid-elements-reader`; `wrangler.jsonc` contains the
public deployment configuration. Run `npm run deploy` for an authorized manual
deployment.

## Import another book

The importer accepts every book in the *Elements* and preserves the source's
section hierarchy, inline cross-references, and Heath's notes.

```bash
python3 scripts/extract_perseus_book.py --book 2 --output app/data/book-2.json
```

After importing a book, add it to the page-level data registry and mark its
entry available in `app/data/catalog.ts`. The reader shell does not need to be
redesigned.

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
