# Hard Hittin' Cards — Website

The official single-page site for **Hard Hittin' Cards** — a trading card shop
and card-show promoter in **Southington, CT**. Sports · Pokémon · Magic ·
Yu-Gi-Oh · One Piece. _Buy · Sell · Trade._

One owned home base that ties the **shop** and the **shows** together — the
flagship quarterly at Foxwoods and everything in between. Ticketing lives on
**[Treasure](https://www.ontreasure.com/u/hardhittincardshows)**; every ticket /
table button links out to the organizer page until event-specific links go live.

A fast, fully interactive, **zero-build** static site. No frameworks, no
compile step — just open `index.html`. That means it hosts anywhere and stays
easy to update for years.

```
index.html            ← page markup & content
assets/
  css/styles.css      ← all styling / design system
  js/main.js          ← interactions + EDITABLE content (carry, shows, hours)
  img/mark.svg        ← logo mark
  img/favicon.svg     ← browser tab icon
vercel.json           ← deploy config
```

## Preview it locally

Because the asset paths are absolute (`/assets/...`), run a tiny local server
rather than double-clicking the file:

```bash
# from this folder — pick whichever you have
python3 -m http.server 8000      # → http://localhost:8000
# or
npx serve .
```

## Update the content (no coding needed)

Open **`assets/js/main.js`** and edit the blocks at the top:

- **`CATEGORIES`** — the "What We Carry" cards.
- **`SHOWS`** — the show calendar. The entry with `featured: true` renders as
  the big flagship card with a live countdown. Set each show's `date`
  (`YYYY-MM-DD`, powers sorting + the countdown), `venue`, `blurb`, and
  `ticketUrl`. Display weekdays are generated from the ISO date, and dated
  events before the visitor's current day are automatically hidden. Use
  `tba: true` with an empty `date` for a date-to-be-announced show.
- **`TREASURE_URL`** — the default ticket/table link. Swap in per-event
  Treasure URLs on each show's `ticketUrl` as they go live.
- **`HOURS`** — store hours, Sunday → Saturday. Times are 24h (`"HH:MM"`) so the
  live **Open now / Closed** badge works. Set `closed: true` for a day off.

Business name, address `1217 Queen St, 2nd Floor, Southington, CT 06489`, phone
`860-316-1075`, and the Instagram handles (`@hardhittincards` /
`@hardhittincardshows`) live in **`index.html`** (search to change).

> **Before launch:** confirm hours in `HOURS`, replace the seeded show dates in
> `SHOWS` with the real calendar, and point each `ticketUrl` at the matching
> Treasure event page. The organizer profile is the safe fallback until those
> event-specific URLs are available.

## Deploy to Vercel

- Import the repo at [vercel.com/new](https://vercel.com/new), or run
  `npx vercel`. No build step or framework preset needed — it's static.
  `vercel.json` is included (clean URLs + long-lived asset caching).
- Point the domain **hardhittincards.com** at the Vercel project.

Any other static host works too (Netlify, GitHub Pages, Cloudflare Pages).

## Notes

- Fonts (Anton / Oswald / Inter) load from Google Fonts. To go fully offline,
  self-host them and swap the `<link>` in `index.html`.
- Respects `prefers-reduced-motion` and is fully keyboard-navigable.
- Includes SEO meta tags, Open Graph, and LocalBusiness structured data with
  hours and both Instagram profiles.
