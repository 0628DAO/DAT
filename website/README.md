# 0628DAO website

This directory contains the English-only official website source for
`https://0628dao.xyz`.

## Files

- `index.html` — complete responsive website
- `deploy-wordpress.mjs` — WordPress REST deployment helper
- `robots.txt` — crawler policy
- `sitemap.xml` — canonical homepage sitemap

## WordPress deployment

Requirements:

- Node.js 22 or newer
- a WordPress administrator username
- a dedicated WordPress Application Password

Never use an account password in the command and never commit credentials.

Run a read-only connection check:

```shell
WP_USERNAME="your-admin-user" \
WP_APPLICATION_PASSWORD="your-application-password" \
node website/deploy-wordpress.mjs
```

Publish the website only after reviewing the source:

```shell
WP_USERNAME="your-admin-user" \
WP_APPLICATION_PASSWORD="your-application-password" \
node website/deploy-wordpress.mjs --apply
```

The deployment updates WordPress page `7`, sets its title and slug to English,
publishes the page, and sets the public site title and tagline. Credentials are
read only from the current process environment.
