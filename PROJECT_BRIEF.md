# Restaurant/Small-Business Website Template — Project Brief

Paste this whole file as your first message in a Claude Code session, or save it
as `CLAUDE.md` in the root of your project repo so Claude Code reads it
automatically at the start of every session.

## What we're building

A reusable website template for a web design business targeting restaurants
and local businesses. One template gets cloned and re-skinned per client.
Build the template first (with placeholder content), get it fully working
end-to-end, THEN start cloning it for real clients.

## Stack (decided, don't reconsider)

- **Site:** static HTML/CSS/JS (no framework needed unless you think a
  lightweight one — e.g. Astro — genuinely simplifies the build; ask before
  adding a framework dependency)
- **Client content editing:** Decap CMS, scoped to the Menu page/collection
  only. Nothing else on the site should be client-editable.
- **Client login for Decap CMS:** DecapBridge (NOT Netlify Identity —
  deliberately avoided, see notes below)
- **Hosting:** Cloudflare Pages or Netlify, free tier
- **Version control:** GitHub, **private** repo per client
- **Domain:** registered separately per client, not part of this build

## Pages (this is the whole site — don't add more without asking)

1. Home — hero section with background (video/image/AI video, toggle in
   config), hours, location, phone, one prominent Order/Reserve CTA
2. Menu — uses the Decap CMS-editable collection, structured as
   name/description/price/category, NOT a PDF or image
3. About
4. Gallery
5. Contact — address, embedded map, phone (tap-to-call on mobile), contact
   form (see "Forms" below)

## Config-driven, not hardcoded

Every piece of business-specific data should live in one config file
(e.g. `content/site.config.json` or `.yaml`) — business name, colors, fonts,
hours, phone, address, social links, background media type/path, menu items.
Cloning the template for a new client should mean: copy repo, edit this one
file (and swap media assets), deploy. No hunting through HTML for hardcoded
strings.

## Background media — build all three, toggle in config

- Static image
- Self-hosted video loop (`<video autoplay muted loop playsinline>`,
  target under 20MB, 1280x720 mp4)
- Same video tag, just pointing at an AI-generated ambient clip instead —
  no special-casing needed in code, it's just another mp4

## Non-negotiable technical requirements

- Mobile-first, fast — target Lighthouse/PageSpeed 85+ on mobile
- Compressed, lazy-loaded images (WebP where possible)
- Accessibility: alt text on all images, keyboard navigation, 4.5:1 contrast
  minimum, visible focus states
- `LocalBusiness` + `Restaurant` schema markup (JSON-LD), populated from the
  config file — don't hand-write per client
- No inline secrets/API keys anywhere in the repo — use hosting-platform
  environment variables

## Decap CMS setup

- Admin panel at `/admin`, config restricted to the Menu collection fields
  only (item name, description, price, category)
- Auth via DecapBridge, not Netlify Identity
- Confirm the non-technical client flow works: they get an email invite,
  click it, set a password, land directly in a simple editor — no GitHub
  account, no technical steps on their end

## Forms

Contact/reservation form → submit to a **Google Form embedded on the page**,
which writes to a Google Sheet. Don't build a custom backend for this.

Note: "sales" reporting is a separate, later concern and is NOT part of this
build — that's Square/Toast's own built-in daily email report, or a
Square-API-to-Sheets automation. Don't build anything for it now.

## Explicitly out of scope for this build

- Online ordering/reservations (embed Toast/Square/OpenTable widgets later,
  don't build custom)
- Payment processing of any kind
- Any auto-deploy "bot" that runs without a human reviewing changes first
- Analytics dashboards beyond Google Analytics + Search Console tags

## First task

Scaffold the template with placeholder content for a fictional restaurant
(pick something reasonable), get it running locally, and confirm the Decap
CMS admin panel loads and can edit a placeholder menu item. Stop and check in
before setting up DecapBridge auth or deploying anywhere.
