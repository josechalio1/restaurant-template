# Restaurant Template

A reusable website template for restaurant/small-business clients. Static
site (Eleventy) with a menu the client can edit themselves through Decap CMS,
without touching code. Demoed here with a placeholder business, "Hollow Oak
Smokehouse" — see [Cloning this for the next client](#cloning-this-for-the-next-client)
for turning this into a real client's site.

## Status: deployed, DecapBridge auth verified end-to-end

`npm install` / `npm start` have been run for real. Along the way this fixed:
a layout bug where page content never actually rendered into `base.njk`, a
menu collection that returned zero items because `content/menu/` sits outside
Eleventy's `src` input dir, and a mobile header that overflowed instead of
collapsing into a menu (now a proper hamburger toggle below 780px).

Live at https://hollow-oak-template.pages.dev, deployed from the private repo
`josechalio1/restaurant-template` via Cloudflare Pages (auto-deploys on push to
`main`). DecapBridge is wired up for real: visiting `/admin/` in production,
clicking Login, and completing DecapBridge's PKCE auth flow lands you
straight in the Decap CMS editor scoped to exactly the Menu collection —
confirmed working, not just configured.

## Run it locally

```
npm install
npm start
```

This starts Eleventy's dev server at `http://localhost:8080`.

To test the `/admin` Decap CMS editor locally (no DecapBridge needed — this
uses `local_backend: true` in `admin/config.yml`, which only activates on
localhost), also run in a second terminal:

```
npx decap-server
```

Then open `http://localhost:8080/admin/` and click Login.

## Project structure

```
src/               → page templates + CSS (the design, not client-editable)
  _includes/       → shared header, footer, base layout
  _data/site.json  → ALL swappable business info lives here
content/menu/      → one markdown file per menu item — this is what
                     Decap CMS actually writes to
admin/             → Decap CMS config, scoped to the menu only
```

## How menu editing actually works

1. Client logs in via the DecapBridge invite link
2. Decap CMS shows them ONLY the menu collection (config.yml restricts this)
3. They edit/add/remove a dish, hit publish
4. Decap CMS commits a change to a file in `content/menu/`
5. That commit triggers a new Netlify/Cloudflare Pages build
6. Eleventy rebuilds `/menu/` with the change — live in a minute or two

They never see the design, other pages, or site settings — see
`PROJECT_BRIEF.md` for why that boundary matters.

## Deploying to Cloudflare Pages

1. Push this repo to a **private** GitHub repo (see below).
2. In the Cloudflare dashboard: Workers & Pages → Create → Pages → Connect
   to Git → pick the repo.
3. Build settings:
   - Framework preset: none / Eleventy (if listed)
   - Build command: `npx eleventy`
   - Build output directory: `_site`
4. No environment variables or secrets are needed for the site build itself.
5. After the first deploy, set up DecapBridge (decapbridge.com/docs) pointed
   at this repo/branch so `admin/config.yml`'s `git-gateway` backend has a
   real auth provider in production — `local_backend: true` only kicks in
   on localhost, so it won't interfere.
6. Point the client's real domain at the Cloudflare Pages project.

`netlify.toml` is left in the repo in case Netlify is used instead — either
host works identically with this static Eleventy setup.

## Before this goes live for a real client

- [x] Run it locally, fix any build errors
- [x] Set up DecapBridge for this specific site (decapbridge.com)
- [ ] Replace every value in `src/_data/site.json` with the real business's info
- [ ] Replace placeholder images/video in `media/` with the real business's
      actual photos (never AI-generated food images — see PROJECT_BRIEF.md)
- [ ] Replace `googleMapsEmbedSrc` in site.json with their real Maps embed
- [ ] Replace the placeholder contact form with a real embedded Google Form
- [ ] Push to a **private** GitHub repo
- [ ] Connect that repo to Cloudflare Pages
- [ ] Point their real domain at it, register in the client's name

## Cloning this for the next client

Copy this whole folder, rename it, and change `src/_data/site.json` plus the
files in `content/menu/`. Almost everything else — layout, CSS, page
structure — should carry over untouched. That reuse is the entire point of
having a template.

## Re-theming a client (colors & fonts)

Colors and fonts are config-driven via `site.json`'s `theme` object — no CSS
editing needed. `style.css` still defines the fallback token values (they
match Hollow Oak exactly), but `base.njk` injects an inline `:root` override
built from `theme.colors`/`theme.fonts`/`theme.radius`, so a new palette or
font pairing is a one-file edit.

**Contrast-critical pairs — check these whenever you swap the palette**, since
nothing enforces WCAG contrast automatically:
- `theme.colors.ember` is used for eyebrow text on the dark `section--dark`
  background and needs ≥4.5:1 against `theme.colors.charcoal`.
- `theme.colors.brassLight` is used for header/footer label text on
  `charcoal` and also needs ≥4.5:1 against it.
- `theme.colors.smoke` is used for body copy on `kraftLight`/`paper` and
  needs ≥4.5:1 against both.
- The focus-outline colors (`charcoal` on light backgrounds, `paper` on
  `charcoal`) need ≥3:1 (WCAG 1.4.11, non-text contrast).

For `theme.fonts`, `family` is the exact ready-to-use `font-family` value
(quotes included) and `googleSpec` is the matching Google Fonts URL segment
— both need to agree on the same font name/weights.

## WhatsApp ordering cart (optional, off by default)

Set `site.json`'s `ordering.enabled` to `true` and fill in `whatsappNumber`
(digits only, country code first) to turn on a cart: each menu item gets an
"Add" button (plus a variant picker if that item's optional `variants`
frontmatter field is set — a comma-separated string like
`"BBQ, Búfalo, Mango Habanero"`), a floating cart button appears on every
page, and `/menu/` gets a cart panel that builds a `wa.me` link summarizing
the order for checkout. Cart state persists in `localStorage` across page
navigations and reloads.

This is a deliberate deviation from the original project brief, which
excluded custom ordering — added because a real client (a WhatsApp-ordering
business) needed it. It's fully opt-in: leave `ordering.enabled: false` and
a client's menu page behaves exactly as it always has, with zero trace of
cart code in the rendered HTML.

Note: cart subtotals are a naive `quantity × price` and don't account for
by-weight `unit` pricing (e.g. Hollow Oak's `"per lb"` items) — fine since a
human reads the final WhatsApp message, but worth knowing before enabling
ordering on a by-weight menu.
