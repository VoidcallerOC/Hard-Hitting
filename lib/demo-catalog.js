import { readFileSync } from "node:fs";
import { join } from "node:path";

// Single source of truth for demo data is the JSON the browser also loads.
// The server reads it from the deployed repo (bundled static asset) so that
// demo mode has ZERO dependency on JustTCG, Supabase, or any live provider.
const CATALOG_PATH = join(process.cwd(), "offer", "data", "demo-catalog.json");

let cache = null;
function loadCatalog() {
  if (cache) return cache;
  cache = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  return cache;
}

// DEMO_MODE is the single server-side switch. It is deliberately explicit:
// when it is on we serve demo data and never fall back to a live provider;
// when it is off the production pricing path runs untouched.
export function isDemoMode() {
  const flag = String(process.env.DEMO_MODE ?? "")
    .trim()
    .toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes" || flag === "on";
}

export function demoGames() {
  return loadCatalog().games;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cardMatches(card, normalizedQuery) {
  if (!normalizedQuery) return true;
  const haystacks = [
    card.name,
    card.card_number,
    card.set_code,
    card.set_name,
    ...(Array.isArray(card.aliases) ? card.aliases : []),
  ];
  return haystacks.some((value) => normalize(value).includes(normalizedQuery));
}

// Returns demo cards for a game that match the query. Never throws for an
// unknown game — it returns [] so the caller reports "no matching cards"
// instead of reaching for a live provider.
export function searchDemoCards(gameId, query, limit = 20) {
  const catalog = loadCatalog();
  const cards = catalog.cards[gameId] ?? [];
  const normalizedQuery = normalize(query);
  return cards
    .filter((card) => cardMatches(card, normalizedQuery))
    .slice(0, limit)
    .map((card) => {
      // Strip demo-only helper fields from the API shape so the response
      // matches the production /api/cards contract.
      const { aliases, ...rest } = card;
      return rest;
    });
}
