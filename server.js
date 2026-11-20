// FeelHub4u server. Keeps every API key on the server and exposes only whitelisted routes. Node 20.6+, no npm install.
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
const PORT = Number(process.env.PORT) || 3000, KEY = process.env.TMDB_API_KEY || "", AI_KEY = process.env.ANTHROPIC_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "", GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const PUB = path.join(__dirname, "public"), TMDB = "https://api.themoviedb.org/3";
const TYPES = { trending: "/trending/movie/week", top: "/movie/top_rated", upcoming: "/movie/upcoming", now: "/movie/now_playing" };
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon" };
const HEAD = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' https://image.tmdb.org https://*.mzstatic.com data:; media-src https://*.apple.com https://*.mzstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; frame-src https://www.youtube-nocookie.com; connect-src 'self' https://itunes.apple.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer", "Cache-Control": "no-store",
};
const hits = new Map();
const bad = () => Object.assign(new Error("bad"), { bad: true });
const img = p => (typeof p === "string" && /^\/[\w.-]+\.(jpg|png)$/.test(p) ? p : null);
const okLoc = s => /^[a-z]{2}(-[A-Z]{2})?$/.test(s);
const okReg = s => /^[A-Z]{2}$/.test(s);
const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { ...HEAD, "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};
function limited(ip) {
  const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 60000);
  h.push(now); hits.set(ip, h);
  if (hits.size > 5000) hits.clear();
  return h.length > 120;
}
async function tmdb(p, params = {}, loc = "en-US") {
  const u = new URL(TMDB + p);
  u.searchParams.set("api_key", KEY);
  u.searchParams.set("language", loc);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("TMDB " + r.status);
  return r.json();
}
const norm = m => ({
  id: m.id, title: String(m.title || ""), year: (m.release_date || "").slice(0, 4),
  date: /^\d{4}-\d{2}-\d{2}$/.test(m.release_date || "") ? m.release_date : "",
  rating: +(m.vote_average || 0).toFixed(1), lang: String(m.original_language || ""),
  overview: (m.overview || "").slice(0, 280), poster: img(m.poster_path), backdrop: img(m.backdrop_path),
});
function readBody(req) {
  return new Promise((resolve, reject) => {
    let n = 0, b = "";
    req.on("data", c => { n += c.length; if (n > 8000) { req.destroy(); reject(bad()); } else b += c; });
    req.on("end", () => { try { resolve(JSON.parse(b || "{}")); } catch { reject(bad()); } });
    req.on("error", reject);
  });
}

async function movies(u) {
  const g = k => u.searchParams.get(k) || "";
  const q = g("q").trim().slice(0, 100), type = g("type") || "trending", genres = g("genres"), lang = g("lang"), page = g("page") || "1", loc = g("loc") || "en-US";
  if (!/^\d{1,3}$/.test(page) || !okLoc(loc) || (lang && !/^[a-z]{2}$/.test(lang)) ||
      (genres && !/^\d+(\|\d+){0,4}$/.test(genres)) || (!q && !genres && type !== "anime" && type !== "dated" && !TYPES[type])) throw bad();
  let d;
  if (type === "dated" && !q) {
    const from = g("from"), to = g("to");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw bad();
    const sort = g("sort") === "desc" ? "primary_release_date.desc" : "primary_release_date.asc";
    d = await tmdb("/discover/movie", { "primary_release_date.gte": from, "primary_release_date.lte": to, sort_by: sort, include_adult: "false", page }, loc);
    return { results: d.results.map(norm), page: d.page, totalPages: Math.min(d.total_pages || 1, 500) };
  }
  if (q) d = await tmdb("/search/movie", { query: q, page }, loc);
  else if (genres || type === "anime") {
    const L = type === "anime" ? "ja" : lang;
    d = await tmdb("/discover/movie", { sort_by: "popularity.desc", "vote_count.gte": 50, page, with_genres: genres || "16", ...(L ? { with_original_language: L } : {}) }, loc);
  } else d = await tmdb(TYPES[type], { page }, loc);
  let list = d.results.map(norm);
  if (lang && !genres && type !== "anime") list = list.filter(m => m.lang === lang);
  return { results: list, page: d.page, totalPages: Math.min(d.total_pages || 1, 500) };
}

const vids = o => o.videos?.results || o.results || [];
const trailerOf = list => {
  const v = list.filter(x => x.site === "YouTube" && /^[\w-]{6,20}$/.test(x.key));
  const t = v.find(x => x.type === "Trailer") || v.find(x => x.type === "Teaser") || v[0];
  return t ? t.key : null;
};
async function details(id, region, loc) {
  const d = await tmdb(`/movie/${id}`, { append_to_response: "videos,watch/providers,credits,recommendations" }, loc);
  let trailer = trailerOf(vids(d));
  if (!trailer && loc !== "en-US") trailer = trailerOf(vids(await tmdb(`/movie/${id}/videos`, {}, "en-US")));
  let overview = d.overview || "";
  if (!overview && loc !== "en-US") overview = (await tmdb(`/movie/${id}`, {}, "en-US")).overview || "";
  const w = region ? d["watch/providers"]?.results?.[region] : null;
  const pick = l => (l || []).map(p => ({ name: String(p.provider_name || "").slice(0, 60), logo: img(p.logo_path) }));
  return {
    id: d.id, title: String(d.title || ""), overview: overview.slice(0, 700), year: (d.release_date || "").slice(0, 4),
    date: /^\d{4}-\d{2}-\d{2}$/.test(d.release_date || "") ? d.release_date : "", lang: String(d.original_language || ""),
    rating: +(d.vote_average || 0).toFixed(1), runtime: Number(d.runtime) || 0, poster: img(d.poster_path),
    genres: (d.genres || []).map(x => String(x.name)).slice(0, 5), backdrop: img(d.backdrop_path), trailer,
    cast: (d.credits?.cast || []).slice(0, 12).map(c => ({ name: String(c.name || "").slice(0, 60), role: String(c.character || "").slice(0, 60), photo: img(c.profile_path) })),
    similar: (d.recommendations?.results || []).slice(0, 12).map(norm),
    providers: w ? { flatrate: pick(w.flatrate), rent: pick(w.rent), buy: pick(w.buy) } : null,
    link: w && typeof w.link === "string" && w.link.startsWith("https://") ? w.link : null,
  };
}

const SYS = "You are the FeelHub4u assistant for movies, anime and songs. Suggest Indian movies first (Hindi, Bangla, Tamil, Telugu, Malayalam) unless the user asks for something else. Keep replies short and friendly. Never say a title is on a specific platform or has subtitles or dubs; tell the user to check the platform. Do not invent facts.";
const LANGW = { hindi: "hi", bollywood: "hi", indian: "hi", bangla: "bn", bengali: "bn", bangali: "bn", tamil: "ta", telugu: "te", malayalam: "ml", kannada: "kn", marathi: "mr", punjabi: "pa", korean: "ko", japanese: "ja", anime: "ja", english: "en" };
async function chat(req, res) {
  if (limited(req.socket.remoteAddress)) return send(res, 429, { error: "Too many requests" });
  const body = await readBody(req);
  const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-10)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 800) }));
  const last = [...msgs].reverse().find(m => m.role === "user");
  if (!last) throw bad();
  const words = last.content.toLowerCase().split(/\W+/);
  const lang = words.map(w => LANGW[w]).find(Boolean) || "hi";
  const anime = words.includes("anime");
  const p = { with_original_language: anime ? "ja" : lang, sort_by: "vote_average.desc", "vote_count.gte": 200 };
  if (anime) p.with_genres = "16";
  const picks = (await tmdb("/discover/movie", p)).results.slice(0, 6).map(norm);
  let reply = "Here are some highly rated picks. Tell me a mood, a language or a genre for more.";
  if (GROQ_KEY) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + GROQ_KEY },
        body: JSON.stringify({ model: GROQ_MODEL, max_tokens: 400, messages: [{ role: "system", content: SYS }, ...msgs] }),
        signal: AbortSignal.timeout(20000),
      });
      if (r.ok) { const j = await r.json(); const t = (j.choices?.[0]?.message?.content || "").trim(); if (t) reply = t; }
      else console.error("[feelhub4u] Groq status", r.status);
    } catch (e) { console.error("[feelhub4u] Groq", e.message); }
  } else if (AI_KEY) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": AI_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 400, system: SYS, messages: msgs }),
        signal: AbortSignal.timeout(20000),
      });
      if (r.ok) { const j = await r.json(); const t = (j.content || []).map(c => c.text || "").join("").trim(); if (t) reply = t; }
      else console.error("[feelhub4u] AI status", r.status);
    } catch (e) { console.error("[feelhub4u] AI", e.message); }
  }
  return send(res, 200, { reply, picks });
}

function staticFile(p, res) {
  const f = path.normalize(path.join(PUB, p === "/" ? "index.html" : decodeURIComponent(p)));
  if (!f.startsWith(PUB + path.sep)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(f, (err, data) => err ? send(res, 404, "Not found", "text/plain")
    : send(res, 200, data, MIME[path.extname(f)] || "application/octet-stream"));
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");
    if (req.method === "POST" && u.pathname === "/api/chat") {
      if (!KEY) return send(res, 503, { error: "Service unavailable" });
      return await chat(req, res);
    }
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    if (u.pathname.startsWith("/api/")) {
      if (limited(req.socket.remoteAddress)) return send(res, 429, { error: "Too many requests" });
      if (!KEY) return send(res, 503, { error: "Service unavailable" });
      if (u.pathname === "/api/movies") return send(res, 200, await movies(u));
      const m = u.pathname.match(/^\/api\/movie\/(\d{1,9})$/);
      if (m) {
        const reg = u.searchParams.get("region") || "", loc = u.searchParams.get("loc") || "en-US";
        if (!okLoc(loc)) throw bad();
        return send(res, 200, await details(m[1], okReg(reg) ? reg : "", loc));
      }
      return send(res, 404, { error: "Not found" });
    }
    return staticFile(u.pathname, res);
  } catch (e) {
    if (e.bad) return send(res, 400, { error: "Invalid request" });
    console.error("[feelhub4u]", e.message);
    return send(res, 502, { error: "Something went wrong" });
  }
});
if (!KEY) console.warn("TMDB_API_KEY is not set. Add it in the environment or .env file.");
if (!AI_KEY && !GROQ_KEY) console.warn("No AI key set (GROQ_API_KEY or ANTHROPIC_API_KEY). Assistant will use the built-in picks only.");
server.listen(PORT, () => console.log(`FeelHub4u running on port ${PORT}`));
