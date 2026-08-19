# Noor e Kala content management

The website is a Next.js app with a local **SQLite** database. It has a private
**Owner Studio** at `/admin` — the only place used to manage the live shop.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and set:
   - `ADMIN_PASSWORD` — the password for `/admin`
   - `ADMIN_SESSION_SECRET` — a long random string; generate one with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. `npm run dev`, then open http://localhost:3000

The database is created automatically at `data/store.db` on first run and seeded
from `data/products.json` and `data/site.json`, so the shop is populated
immediately. Seeding only happens when the products table is empty.

## Product pages

Every product has its own page at `/shop/<name>`, for example
`/shop/green-gold-geode-clock`. Send that link to a customer on WhatsApp and it
unfurls with the photo, name and price. The addresses are generated from the
product name automatically when you add one.

## Reviews

Customers can leave a review on any product page. Reviews are held as
**pending** and never appear on the shop until you approve them under
**Reviews** in the studio — the sidebar shows a count when any are waiting.

## Occasions and sale campaigns

Customers can shop by **moment** (Weddings, Anniversaries, For Mum, Rakhi, New
Baby, Farewell) as well as by material. Six occasions are set up to start with,
with pieces already tagged — rename, retag or delete any of them.

An occasion doubles as a **sale campaign**:

1. Go to **Occasions & offers** in the studio.
2. Set a **discount %** above 0 on any occasion.
3. Optionally set **Starts on** / **Ends on** — leave blank to run until you
   switch it off — and a **headline** for the homepage.
4. Save.

Everything else happens on its own: a gold offer banner appears on the homepage
with a rail of the discounted pieces, sale badges show on the shop, the old price
is struck through, and the cart charges the discounted price. Set the discount
back to 0 and it all disappears.

Tag which pieces belong to which occasion under **Tagging** in the same panel.
Offers never stack — a piece in two live sales gets the bigger discount, once.

## Personalisation preview

Eleven pieces take a name, date or photo. On those, the shop shows a live
preview: the customer types their wording, picks a finish, and sees it rendered
beside the product photo. The wording travels with the order — it appears in the
cart and as a `↳ "Aanya & Rohan" · Gold` line under the item in your WhatsApp
message — so you no longer have to ask for it afterwards.

The photo shown alongside is the existing product photo, clearly labelled "the
piece". It is deliberately *not* drawn over: those photos already carry a
previous customer's name, and overlaying produced two names at once. If you ever
photograph a piece with no lettering on it, set `previewImage` in that product's
personalisation config and the text will be laid directly onto it instead.

Configuration lives in `lib/personalise.ts` — the field label, placeholder,
character limit, lettering style and available finishes per piece.

## Saved pieces, waiting list and hampers

- **Saved pieces** — customers tap the ♡ on any piece; it is kept on their device
  (no account) and listed at `/wishlist`.
- **Waiting list** — when a piece is sold out, its page offers "tell me when it's
  back". Those requests appear under **Waiting list** in the studio, and flip to
  *"back in stock — message them"* the moment you un-tick Sold out. Message them
  on WhatsApp, then hit **Mark as told**.
- **Gift hampers** — `/hampers` lets customers pick pieces and get a bundle
  discount, then sends the whole hamper to your WhatsApp. Change the rules in
  `lib/site.ts`: `HAMPER_MIN` (default 3 pieces) and `HAMPER_DISCOUNT`
  (default 0.1, i.e. 10%).

## What the owner can change at /admin

- Add a product with one or more photos (uploads go to `public/uploads/`).
- Change the selling price, and set an MRP to show a discount percentage.
- Mark an item as trending, new, sold out, or enquiry-only.
- Set a low-stock amount.
- Edit the description, custom note and category.
- Add and reorder collections.
- Edit the announcement bar at the top of the shop.
- Update the status of incoming orders.

## Daily workflow

1. Open `/admin` and sign in with `ADMIN_PASSWORD`.
2. Add or edit products. Changes appear on the shop immediately.
3. Orders arrive under **Orders** with name, phone, address, items and note.

## How ordering works

There is no payment on the site. When a customer sends their cart the order is
saved to SQLite and appears in the studio, and WhatsApp opens with the order
pre-filled, addressed to the number in the `WHATSAPP_NUMBER` environment
variable. That number is never written into the pages — every button points at
`/wa`, which attaches it server-side — so scrapers cannot harvest it.

## Important notes

**This project folder is synced by OneDrive.** SQLite and file-sync tools do not
mix well. If you ever see "database is locked" or corruption, move the database
out of the synced folder by setting `DATABASE_PATH` in `.env.local`:

```
DATABASE_PATH=C:\Users\<you>\AppData\Local\noor-e-kala\store.db
```

**Backups — use the command, do not copy the file.**

```
npm run backup
```

That writes a verified `.sql` dump to `backups/` and prints what it contains. Do
**not** just copy `data/store.db` by hand: the database runs in WAL mode, so
recent writes live in `data/store.db-wal` and a bare copy of the `.db` opens
empty ("no such table: products"). The dump also works against the live Turso
database once deployed.

The database is gitignored and holds every product, order and review, so it is
the only copy — run the backup before any risky change, and keep one off this
machine.

**Deployment.** See `DEPLOY.md`. The site runs on Vercel; the database is Turso
(hosted SQLite) when `TURSO_DATABASE_URL` is set, and falls back to a temporary
copy of `data/seed.sql` when it is not — fine for a demo, but nothing written
there survives a redeploy.

`data/seed.sql` is committed and published, so regenerate it with
`node scripts/backup.mjs data/seed.sql --catalogue-only`, which deliberately
omits orders, reviews and waiting-list contacts. A plain `npm run backup`
includes everything and is for your own safekeeping only.

## Running

| Command | What it does |
|---|---|
| `npm run dev` | Development server on :3000. Slow to compile, hot-reloads. |
| `npm run build` | Production build. |
| `npm start` | Production server — this is the one that reflects real speed. |
