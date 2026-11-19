// MovieFinder server: the TMDB key stays here, the browser never sees it.
// Requires Node.js 20.6+ (no npm install needed).
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const KEY = process.env.TMDB_API_KEY || "";
const PUBLIC = path.join(__dirname, "public");
const TMDB = "https://api.themoviedb.org/3";
const TYPES = { trending: "/trending/movie/week", top: "/movie/top_rated", upcoming: "/movie/upcoming", now: "/movie/now_playing" };
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".png": "image/png" };
const HEADERS = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' https://image.tmdb.org https://*.mzstatic.com data:; media-src https://*.apple.com https://*.mzstatic.com; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-src https://www.youtube-nocookie.com; connect-src 'self' https://itunes.apple.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store",
};
const hits = new Map();
const bad = () => Object.assign(new Error("bad request"), { bad: true });

if (!KEY) console.warn("TMDB_API_KEY is not set. Add it to the .env file.");

function send(res, code, body, type = "application/json") {
  res.writeHead(code, { ...HEADERS, "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}

const img = p => (typeof p === "string" && /^\/[\w.-]+\.(jpg|png)$/.test(p) ? p : null);

function limited(ip) {
  const now = Date.now();
  const h = (hits.get(ip) || []).filter(t => now - t < 60000);
  h.push(now);
  hits.set(ip, h);
  if (hits.size > 5000) hits.clear();
  return h.length > 120;
}

async function tmdb(p, params = {}) {
  const u = new URL(TMDB + p);
  u.searchParams.set("api_key", KEY);
  u.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("TMDB responded " + r.status);
  return r.json();
}

const norm = m => ({
  id: m.id,
  title: String(m.title || ""),
  year: (m.release_date || "").slice(0, 4),
  rating: +(m.vote_average || 0).toFixed(1),
  lang: String(m.original_language || ""),
  overview: (m.overview || "").slice(0, 280),
  poster: img(m.poster_path),
});

async function movies(u) {
  const q = (u.searchParams.get("q") || "").trim().slice(0, 100);
  const type = u.searchParams.get("type") || "trending";
  const genres = u.searchParams.get("genres") || "";
  const lang = u.searchParams.get("lang") || "";
  const page = u.searchParams.get("page") || "1";
  if (!/^\d{1,3}$/.test(page) || (lang && !/^[a-z]{2}$/.test(lang)) ||
      (genres && !/^\d+(\|\d+){0,4}$/.test(genres)) || (!q && !genres && !TYPES[type])) throw bad();

  let d;
  if (q) d = await tmdb("/search/movie", { query: q, page });
  else if (genres) d = await tmdb("/discover/movie", {
    with_genres: genres, sort_by: "popularity.desc", "vote_count.gte": 50, page,
    ...(lang ? { with_original_language: lang } : {}),
  });
  else d = await tmdb(TYPES[type], { page });

  let list = d.results.map(norm);
  if (!genres && lang) list = list.filter(m => m.lang === lang);
  return { results: list, page: d.page, totalPages: Math.min(d.total_pages || 1, 500) };
}

async function details(id, region) {
  const d = await tmdb(`/movie/${id}`, { append_to_response: "videos,watch/providers" });
  const vids = (d.videos?.results || []).filter(v => v.site === "YouTube" && /^[\w-]{6,20}$/.test(v.key));
  const trailer = vids.find(v => v.type === "Trailer") || vids[0];
  const w = d["watch/providers"]?.results?.[region];
  const pick = list => (list || []).map(p => ({ name: String(p.provider_name || "").slice(0, 60), logo: img(p.logo_path) }));
  return {
    id: d.id,
    title: String(d.title || ""),
    overview: (d.overview || "").slice(0, 600),
    year: (d.release_date || "").slice(0, 4),
    rating: +(d.vote_average || 0).toFixed(1),
    runtime: Number(d.runtime) || 0,
    genres: (d.genres || []).map(g => String(g.name)).slice(0, 5),
    backdrop: img(d.backdrop_path),
    trailer: trailer ? trailer.key : null,
    providers: w ? { flatrate: pick(w.flatrate), rent: pick(w.rent), buy: pick(w.buy) } : null,
    link: w?.link && w.link.startsWith("https://") ? w.link : null,
  };
}

function staticFile(p, res) {
  const f = path.normalize(path.join(PUBLIC, p === "/" ? "index.html" : decodeURIComponent(p)));
  if (!f.startsWith(PUBLIC + path.sep)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(f, (err, data) =>
    err ? send(res, 404, "Not found", "text/plain") : send(res, 200, data, MIME[path.extname(f)] || "application/octet-stream"));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    const u = new URL(req.url, "http://localhost");
    if (u.pathname.startsWith("/api/")) {
      if (limited(req.socket.remoteAddress)) return send(res, 429, { error: "Too many requests" });
      if (!KEY) return send(res, 503, { error: "Service unavailable" });
      if (u.pathname === "/api/movies") return send(res, 200, await movies(u));
      const m = u.pathname.match(/^\/api\/movie\/(\d{1,9})$/);
      if (m) {
        const reg = u.searchParams.get("region") || "";
        return send(res, 200, await details(m[1], /^[A-Z]{2}$/.test(reg) ? reg : "BD"));
      }
      return send(res, 404, { error: "Not found" });
    }
    return staticFile(u.pathname, res);
  } catch (e) {
    if (e.bad) return send(res, 400, { error: "Invalid request" });
    console.error("[movie-finder]", e.message);
    return send(res, 502, { error: "Something went wrong" });
  }
});

server.listen(PORT, () => console.log(`MovieFinder running at http://localhost:${PORT}`));
