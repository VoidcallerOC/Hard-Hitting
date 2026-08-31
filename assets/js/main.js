/* =========================================================
   HARD HITTIN' CARDS — interactive site behaviour
   Vanilla JS, no dependencies. Edit the DATA block below to
   update what you carry, the show calendar and hours — no
   other changes needed.
   ========================================================= */

/* ------------------------------------------------------------------
   DATA — the only thing you normally need to edit.
   ------------------------------------------------------------------ */

// Ticketing lives on Treasure. Per-show URLs default to the shop page below.
const TREASURE_URL = "https://www.ontreasure.com/u/hardhittincardshows";

// What we carry on the shop floor.
const CATEGORIES = [
  { tag: "Sports Cards",      name: "Sports",        note: "Baseball, basketball, football & hockey — vintage to modern, singles to sealed wax.", suit: "⚾", color: "#F03047" },
  { tag: "Trading Card Game", name: "Pokémon",       note: "Booster boxes, ETBs, singles & the latest sets — always fresh.",                     suit: "⚡", color: "#F6B821" },
  { tag: "Trading Card Game", name: "Magic: The Gathering", note: "Singles, sealed, Commander decks & supplies.",                              suit: "🔮", color: "#7A4DD0" },
  { tag: "Trading Card Game", name: "Yu-Gi-Oh!",     note: "Structure decks, tins, singles & tournament staples.",                             suit: "🎴", color: "#2E86C0" },
  { tag: "Trading Card Game", name: "One Piece TCG",  note: "The fastest-growing anime TCG — sealed & singles.",                               suit: "🏴‍☠️", color: "#C0392B" },
  { tag: "Gear & More",       name: "Supplies",       note: "Sleeves, top loaders, binders, boxes & everything to protect the hits.",           suit: "🛡️", color: "#35D07F" },
];

// SHOW CALENDAR — data driven. The `featured` show renders as the flagship
// hero above the grid. Set `date` as YYYY-MM-DD (used for sorting + countdown);
// leave `date` empty and set `tba:true` for a date-to-be-announced show.
// Every "Get Tickets" button links OUT to Treasure — set `ticketUrl` per show.
const SHOWS = [
  {
    featured: true,
    title: "Hard Hittin' Cards Show at Foxwoods",
    venue: "Rainmaker Expo Center · Foxwoods Resort Casino",
    date: "2026-10-18",
    when: "Sun · Oct 18, 2026 · 9AM–4PM",
    blurb: "Our flagship quarterly — a major Connecticut card show with vendors, breakers and collectors under one roof at Foxwoods. Sports, Pokémon and every TCG, plus giveaways and grails.",
    stats: [
      { n: "Large", l: "Show Floor" },
      { n: "CT", l: "Flagship Show" },
      { n: "Quarterly", l: "Flagship" },
    ],
    ticketUrl: TREASURE_URL,
  },
  {
    title: "Fall Sports Card Spectacular",
    venue: "Central Connecticut",
    date: "2026-09-20",
    when: "Sun · Sep 20, 2026",
    blurb: "A sports-first show timed for football & hoops season. Breakers welcome.",
    ticketUrl: TREASURE_URL,
  },
  {
    title: "Holiday Hit Fest",
    venue: "Greater Hartford, CT",
    date: "2026-12-13",
    when: "Sun · Dec 13, 2026",
    blurb: "Stock up before the holidays — sealed wax, singles and gift-ready slabs.",
    ticketUrl: TREASURE_URL,
  },
  {
    title: "Winter Foxwoods Show",
    venue: "Rainmaker Expo Center · Foxwoods",
    date: "",
    tba: true,
    when: "Dates TBA — follow @hardhittincardshows",
    blurb: "The next quarterly flagship at Foxwoods. Dates and tickets drop on Treasure.",
    ticketUrl: TREASURE_URL,
  },
];

// Store hours. Order = Sunday..Saturday to match Date.getDay().
// Use 24h "HH:MM" for open/close so the live open/closed status works.
// Set closed:true for a day off.
const HOURS = [
  { day: "Sunday",    open: "12:00", close: "18:00" },
  { day: "Monday",    open: "12:00", close: "20:00" },
  { day: "Tuesday",   open: "12:00", close: "20:00" },
  { day: "Wednesday", open: "12:00", close: "20:00" },
  { day: "Thursday",  open: "12:00", close: "20:00" },
  { day: "Friday",    open: "12:00", close: "20:00" },
  { day: "Saturday",  open: "12:00", close: "18:00" },
];

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fmt12(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}
function shortDate(iso) {
  if (!iso) return { mon: "TBA", day: "", yr: "" };
  const d = new Date(iso + "T00:00:00");
  return {
    mon: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    yr: d.getFullYear(),
  };
}
function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function eventWhen(show) {
  if (!show.date) return show.when || "Dates TBA";
  const d = new Date(show.date + "T00:00:00");
  const weekday = d.toLocaleString("en-US", { weekday: "short" });
  const date = d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${weekday} · ${date}${show.time ? ` · ${show.time}` : ""}`;
}

/* ------------------------------------------------------------------
   Render: what we carry
   ------------------------------------------------------------------ */
function renderCarry() {
  const grid = $("#carryGrid");
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map((c, i) => `
    <article class="cat" data-reveal data-reveal-delay="${(i % 3) + 1}">
      <div class="glow" style="background:${c.color}"></div>
      <span class="tag">${c.tag}</span>
      <div>
        <h4>${c.name}</h4>
        <p>${c.note}</p>
      </div>
      <span class="chip-suit">${c.suit}</span>
    </article>`).join("");
}

/* ------------------------------------------------------------------
   Render: flagship + show calendar
   ------------------------------------------------------------------ */
function renderShows() {
  const today = todayIso();
  const featured = SHOWS.find((s) => s.featured && (!s.date || s.date >= today));
  const rest = SHOWS.filter((s) => !s.featured)
    .filter((s) => s.tba || !s.date || s.date >= today)
    .slice()
    .sort((a, b) => {
      if (a.tba && !b.tba) return 1;
      if (b.tba && !a.tba) return -1;
      return (a.date || "").localeCompare(b.date || "");
    });

  // Flagship
  const fWrap = $("#flagship");
  if (fWrap && featured) {
    const stats = (featured.stats || [])
      .map((s) => `<div class="st"><b>${s.n}</b><span>${s.l}</span></div>`)
      .join("");
    fWrap.innerHTML = `
      <div class="flag-copy-wrap">
        <span class="flag-badge">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.7L12 17.3 5.8 20.8l1.6-6.7L2.2 8.9l6.9-.6z"/></svg>
          Flagship Event
        </span>
        <h3>${featured.title}</h3>
        <div class="flag-where">${featured.venue}</div>
        <p class="flag-copy">${featured.blurb}</p>
        <div class="flag-stats">${stats}</div>
        <div class="flag-actions">
          <a class="btn btn--gold" href="${featured.ticketUrl}" target="_blank" rel="noopener">
            Get Tickets on Treasure
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
          </a>
          <a class="btn btn--ghost" href="https://maps.google.com/?q=Foxwoods+Rainmaker+Expo+Center" target="_blank" rel="noopener">Foxwoods Map</a>
        </div>
        <p class="flag-note">Tickets & full vendor info hosted on Treasure (ontreasure.com).</p>
      </div>
      <div class="flag-visual" aria-hidden="true">
        <div class="ticket" id="flagTicket">
          <div class="t-top">
            <span class="lbl">Admit One</span>
            <span class="venue">Foxwoods</span>
          </div>
          <div class="countdown" id="countdown"></div>
          <div class="t-when">${eventWhen(featured)}</div>
        </div>
      </div>`;
    startCountdown(featured.date);
  }

  // Calendar grid
  const cal = $("#calGrid");
  if (cal) {
    cal.innerHTML = rest.map((s, i) => {
      const d = shortDate(s.date);
      const chip = s.tba
        ? `<span class="date-chip">TBA</span>`
        : `<span class="date-chip">${d.mon} ${d.day} <span class="yr">${d.yr}</span></span>`;
      return `
      <article class="show ${s.tba ? "tba" : ""}" data-reveal data-reveal-delay="${(i % 4) + 1}">
        ${chip}
        <h4>${s.title}</h4>
        <span class="meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${s.venue}
        </span>
        <span class="meta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          ${eventWhen(s)}
        </span>
        <div class="show-actions">
          <a class="link-out" href="${s.ticketUrl}" target="_blank" rel="noopener">
            ${s.tba ? "Details on Treasure" : "Get Tickets"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
          </a>
        </div>
      </article>`;
    }).join("");
  }
}

/* ------------------------------------------------------------------
   Flagship countdown
   ------------------------------------------------------------------ */
let countdownTimer = null;
function startCountdown(iso) {
  const el = $("#countdown");
  if (!el) return;
  const target = iso ? new Date(iso + "T09:00:00").getTime() : NaN;

  const tick = () => {
    const now = Date.now();
    let diff = target - now;
    if (!iso || isNaN(target) || diff <= 0) {
      el.outerHTML = `<div class="t-live" id="countdown">Show Day is Here! 🎉</div>`;
      if (countdownTimer) clearInterval(countdownTimer);
      return;
    }
    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hrs  = Math.floor(diff / 3600000);  diff -= hrs * 3600000;
    const mins = Math.floor(diff / 60000);
    const unit = (n, l) => `<div class="cd-unit"><b>${String(n).padStart(2, "0")}</b><span>${l}</span></div>`;
    el.innerHTML = unit(days, "Days") + unit(hrs, "Hrs") + unit(mins, "Min");
  };
  tick();
  if (!reduceMotion) countdownTimer = setInterval(tick, 30000);
}

/* ------------------------------------------------------------------
   Render: hours (highlight today + live open/closed)
   ------------------------------------------------------------------ */
function renderHours() {
  const list = $("#hoursList");
  const status = $("#hoursStatus");
  const now = new Date();
  const today = now.getDay(); // 0 = Sunday

  if (list) {
    list.innerHTML = HOURS.map((h, i) => `
      <li class="${i === today ? "today" : ""}">
        <span class="d">${h.day}</span>
        <span class="t">${h.closed ? "Closed" : `${fmt12(h.open)} – ${fmt12(h.close)}`}</span>
      </li>`).join("");
  }

  if (status) {
    const h = HOURS[today];
    let isOpen = false;
    if (h && !h.closed) {
      const mins = now.getHours() * 60 + now.getMinutes();
      const [oh, om] = h.open.split(":").map(Number);
      const [ch, cm] = h.close.split(":").map(Number);
      isOpen = mins >= oh * 60 + om && mins < ch * 60 + cm;
    }
    status.className = `hours-status ${isOpen ? "open" : "closed"}`;
    status.innerHTML = `<span class="dot"></span>${
      isOpen ? `Open now · until ${fmt12(h.close)}` : "Closed right now"
    }`;
  }
}

/* ------------------------------------------------------------------
   Scroll reveal
   ------------------------------------------------------------------ */
function initReveal() {
  const els = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------
   Nav: scrolled state + mobile menu + smooth anchors
   ------------------------------------------------------------------ */
function initNav() {
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#navToggle");
  const closeMenu = () => { document.body.classList.remove("menu-open"); toggle.setAttribute("aria-expanded", "false"); };
  toggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("#navMenu a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
}

/* ------------------------------------------------------------------
   Custom cursor glow (desktop, pointer:fine only)
   ------------------------------------------------------------------ */
function initCursor() {
  const glow = $(".cursor-glow");
  if (!glow || reduceMotion || !window.matchMedia("(pointer:fine)").matches) return;
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX; ty = e.clientY;
    document.body.classList.add("cursor-active");
  });
  (function loop() {
    x += (tx - x) * 0.14; y += (ty - y) * 0.14;
    glow.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ------------------------------------------------------------------
   Hero floating cards + parallax
   ------------------------------------------------------------------ */
function initHeroCards() {
  const layer = $("#heroCards");
  if (!layer || reduceMotion) return;
  const spots = [
    { l: "8%",  t: "22%", r: -14, d: 0 },
    { l: "16%", t: "64%", r: 10,  d: 1 },
    { l: "78%", t: "18%", r: 12,  d: 2 },
    { l: "86%", t: "60%", r: -10, d: 3 },
    { l: "50%", t: "80%", r: 6,   d: 4 },
  ];
  layer.innerHTML = spots.map((s) =>
    `<div class="float-card" style="left:${s.l};top:${s.t};transform:rotate(${s.r}deg)" data-depth="${s.d}"><i></i></div>`
  ).join("");

  const cards = $$(".float-card", layer);
  cards.forEach((c, i) => {
    c.animate(
      [{ transform: c.style.transform + " translateY(0px)" },
       { transform: c.style.transform + " translateY(-18px)" },
       { transform: c.style.transform + " translateY(0px)" }],
      { duration: 6000 + i * 900, iterations: Infinity, easing: "ease-in-out" }
    );
  });

  if (window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      const dx = (e.clientX / innerWidth - 0.5);
      const dy = (e.clientY / innerHeight - 0.5);
      cards.forEach((c) => {
        const depth = (+c.dataset.depth + 1) * 6;
        c.style.marginLeft = `${dx * depth * -1}px`;
        c.style.marginTop = `${dy * depth * -1}px`;
      });
    }, { passive: true });
  }
}

/* ------------------------------------------------------------------
   Misc
   ------------------------------------------------------------------ */
function initMisc() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
  const track = $("#marquee");
  if (track) track.innerHTML += track.innerHTML; // seamless loop
}

/* ------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  renderCarry();
  renderShows();
  renderHours();
  initMisc();
  initReveal();
  initNav();
  initCursor();
  initHeroCards();
});
