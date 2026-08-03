# Hollow Oak Smokehouse — website template

A placeholder restaurant built as a reusable template. Static site (Eleventy)
with a menu that the client can edit themselves through Decap CMS, without
touching code.

## Status: deployed, DecapBridge auth verified end-to-end

`npm install` / `npm start` have been run for real. Along the way this fixed:
a layout bug where page content never actually rendered into `base.njk`, a
menu collection that returned zero items because `content/menu/` sits outside
Eleventy's `src` input dir, and a mobile header that overflowed instead of
collapsing into a menu (now a proper hamburger toggle below 780px).

Live at https://hollow-oak-template.pages.dev, deployed from the private repo
`josechalio1/josechalio1` via Cloudflare Pages (auto-deploys on push to
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
