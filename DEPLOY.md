# Putting Noor e Kala online — free

## The address to use

**https://noor-e-kala.vercel.app**

Bookmark that one. Every deploy also mints a throwaway URL like
`noor-e-kala-7tecbp2hb-…vercel.app` which is frozen at that build forever —
useful for checking an old version, useless for looking at the current site.
Share and open the short address above; it always points at the newest deploy.

The site runs on **Vercel** (the web app) plus **Turso** (the database) plus
**Vercel Blob** (uploaded product photos). All three have free tiers that are
comfortably more than a shop this size needs.

Why not Vercel alone: its filesystem is wiped on every deploy. The database and
your uploaded photos would vanish each time. Turso and Blob are what keep them.

Nothing about the code changes between local and hosted — only environment
variables. Locally, with none of them set, it still uses `data/store.db` and
`public/uploads/` exactly as it does today.

---

## 1. Put the code on GitHub

```bash
git add -A
git commit -m "Noor e Kala storefront"
git branch -M main
git remote add origin https://github.com/<you>/noor-e-kala.git
git push -u origin main
```

`.env.local`, `data/*.db` and `backups/` are gitignored — your password and
database are not uploaded.

## 2. Create the database (Turso)

1. Sign up at <https://turso.tech> and install their CLI.
2. Create the database and get its credentials:

```bash
turso db create noor-e-kala
turso db show noor-e-kala --url        # -> libsql://noor-e-kala-<you>.turso.io
turso db tokens create noor-e-kala     # -> a long token
```

3. Load your current data into it, using the backup you already have:

```bash
npm run backup                          # writes backups/store-<date>.sql
turso db shell noor-e-kala < backups/store-<date>.sql
```

That is the whole migration — the dump is plain SQL and Turso *is* SQLite.

## 3. Deploy to Vercel

1. Sign in at <https://vercel.com> with GitHub and import the repository.
2. Before the first deploy, add these **Environment Variables**:

| Name | Value |
|---|---|
| `TURSO_DATABASE_URL` | the `libsql://…` URL from step 2 |
| `TURSO_AUTH_TOKEN` | the token from step 2 |
| `ADMIN_PASSWORD` | **a new strong password**, not the one you use locally |
| `ADMIN_SESSION_SECRET` | run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` at first, your domain later |

3. Deploy.

## 4. Turn on photo uploads

In your Vercel project: **Storage → Create → Blob**. Vercel adds
`BLOB_READ_WRITE_TOKEN` for you. Redeploy once.

With that token present, admin photo uploads go to Blob and get a permanent URL.
Without it they fall back to `public/uploads/`, which is why local development
needs no setup. See `lib/storage.ts`.

## 5. Check it works

- Open the site, then `/admin`, and sign in with the **new** password.
- Add a test product with a photo, confirm it shows on the shop.
- Place a test order, confirm it appears in the studio.
- Delete both when you are happy.

## Adding your domain later

Vercel project → **Settings → Domains** → add it and follow the DNS steps. Then
update `NEXT_PUBLIC_SITE_URL` to the real address and redeploy, so product links,
WhatsApp previews and the sitemap all point at the right place.

---

## Keeping it safe

**Back up regularly.** With Turso credentials in your environment, `npm run backup`
dumps the *live* database, not the local one:

```bash
TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… npm run backup
```

Keep a copy somewhere other than this laptop. Free tiers can be suspended.

**Never commit `.env.local`.** If a token ever leaks, rotate it in Turso/Vercel
and redeploy.

**Watch the free limits.** They change; check current terms rather than trusting
a number written here. If the shop starts earning, a small paid plan removes a
whole category of worry — free is the right way to start, not the right way to
stay.
