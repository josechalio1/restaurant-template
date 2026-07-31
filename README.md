# Hollow Oak Smokehouse — website template

A placeholder restaurant built as a reusable template. Static site (Eleventy)
with a menu that the client can edit themselves through Decap CMS, without
touching code.

## ⚠️ Important: this has not been build-tested yet

This was written in an environment with no internet access, so `npm install`
and `npx eleventy` have never actually been run against it. The structure and
syntax follow standard, well-established Eleventy + Nunjucks + Decap CMS
patterns, but **the very first thing to do is run it and fix whatever
surfaces** — treat this as a strong first draft, not a verified build.

## Run it locally

```
npm install
npm start
```

This starts Eleventy's dev server (usually `http://localhost:8080`). If
something errors on `npm install` or `npm start`, that's expected to be step
one — paste the error into Claude Code (this project's `PROJECT_BRIEF.md`
gives it full context) and get it fixed there.

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

## Before this goes live for a real client

- [ ] Run it locally, fix any build errors
- [ ] Set up DecapBridge for this specific site (decapbridge.com)
- [ ] Replace every value in `src/_data/site.json` with the real business's info
- [ ] Replace placeholder images/video in `media/` with the real business's
      actual photos (never AI-generated food images — see PROJECT_BRIEF.md)
- [ ] Replace `googleMapsEmbedSrc` in site.json with their real Maps embed
- [ ] Replace the placeholder contact form with a real embedded Google Form
- [ ] Push to a **private** GitHub repo
- [ ] Connect that repo to Netlify or Cloudflare Pages
- [ ] Point their real domain at it, register in the client's name

## Cloning this for the next client

Copy this whole folder, rename it, and change `src/_data/site.json` plus the
files in `content/menu/`. Almost everything else — layout, CSS, page
structure — should carry over untouched. That reuse is the entire point of
having a template.
