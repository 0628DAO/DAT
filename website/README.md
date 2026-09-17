# 0628DAO website

This directory contains the English-only official website source for
`https://0628dao.xyz`.

## Files

- `index.html` — complete responsive website
- `robots.txt` — crawler policy
- `sitemap.xml` — canonical homepage sitemap

## XServer deployment

The production deployment does not require WordPress access.

Upload these files to the document root for `0628dao.xyz`:

- `index.html`
- `robots.txt`
- `sitemap.xml`

Keep the existing WordPress installation in place. XServer serves `index.html`
before the existing WordPress `index.php`, so the official static website can
replace the public Coming Soon page without deleting WordPress data.

After upload, verify:

1. `https://0628dao.xyz/` returns the English 0628DAO homepage.
2. The page title is `0628DAO — Open Infrastructure for AI-Agent Economies`.
3. Mainnet and testnet explorer links open the intended contract addresses.
4. Desktop and mobile layouts display without horizontal overflow.
