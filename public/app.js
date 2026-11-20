const IMG = "https://image.tmdb.org/t/p/", $ = i => document.getElementById(i), Q = (s, r = document) => r.querySelector(s), QA = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const LOC = "en-US";
const CODES = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW";
const DN = (() => { try { return new Intl.DisplayNames(["en"], { type: "region" }); } catch { return null; } })();
const REG = CODES.split(" ").map(c => [c, (DN && DN.of(c)) || c]).sort((a, b) => a[1].localeCompare(b[1]));
const regOpts = sel => `<option value="">Select country</option>` + REG.map(([v, l]) => `<option value="${v}"${v === sel ? " selected" : ""}>${l}</option>`).join("");
const AREG = (() => { try { const r = new Intl.Locale(navigator.language).region; return REG.some(x => x[0] === r) ? r : ""; } catch { return ""; } })();
const LANGS = [["", "All languages"], ["hi", "Hindi"], ["bn", "Bangla"], ["ta", "Tamil"], ["te", "Telugu"], ["ml", "Malayalam"], ["kn", "Kannada"], ["mr", "Marathi"], ["pa", "Punjabi"], ["en", "English"], ["ko", "Korean"], ["ja", "Japanese"], ["zh", "Chinese"], ["th", "Thai"], ["es", "Spanish"], ["fr", "French"], ["tr", "Turkish"]];
const MC = [["Trending", "trending", ""], ["Top Rated", "top", ""], ["Upcoming", "upcoming", ""], ["Now Playing", "now", ""], ["Action", "", "28"], ["Comedy", "", "35"], ["Drama", "", "18"], ["Romance", "", "10749"], ["Thriller", "", "53"], ["Horror", "", "27"], ["Sci-Fi", "", "878"], ["Animation", "", "16"], ["Happy", "", "35|16|10751"], ["Sad", "", "18|10749"], ["Excited", "", "28|12|53"], ["Scared", "", "27|53"], ["Relaxed", "", "16|10751|14"], ["Thoughtful", "", "99|36|9648"]];
const SC = [["Top Hits", "top hits"], ["Bangla", "bangla songs"], ["Bollywood", "bollywood hits"], ["English Pop", "english pop hits"], ["Romantic", "romantic love songs"], ["Sad", "sad songs"], ["Party", "party dance hits"], ["Chill", "lofi chill"]];
const GID = { Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80, Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36, Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, "Science Fiction": 878, Thriller: 53, War: 10752, Western: 37 };
const KW = { bangla: "bn", bengali: "bn", hindi: "hi", bollywood: "hi", indian: "hi", tamil: "ta", telugu: "te", malayalam: "ml", kannada: "kn", marathi: "mr", punjabi: "pa", korean: "ko", japanese: "ja", english: "en", spanish: "es", french: "fr", sad: "18|10749", cry: "18|10749", romantic: "10749", love: "10749", funny: "35", comedy: "35", scary: "27|53", horror: "27", thriller: "53", action: "28", kids: "10751|16", family: "10751", cartoon: "16", scifi: "878", "sci-fi": "878", war: "10752", history: "36", documentary: "99" };
const INFO = {
  about: { t: "About FeelHub4u", b: [["What it is", "FeelHub4u is a movie, anime and song finder. It shows trending and upcoming films, lets you save favourites, and plays 30-second song previews."], ["Who it is for", "Anyone who wants a quick answer to “what should I watch tonight?”, including people who look for Indian, Bangla, anime and world cinema."]] },
  help: { t: "Help", b: [["Search", "Type plain words like “sad bangla”, “horror” or “anime”, then press Enter. Recent searches appear when you click the search box."], ["Save and watch", "Tap the heart to save a movie to My list. Open a movie to see its trailer, cast, similar films and where to stream."], ["Country", "Pick your country inside a movie to see its streaming options. Availability differs by country."], ["Assistant", "The assistant suggests movies by mood, language or genre. Its chat clears when you close it."], ["Shortcuts", "Press / to search and Esc to close any window."]] },
  privacy: { t: "Privacy Policy", b: [["No accounts", "There are no accounts. Your saved list, theme and recent searches stay in your browser."], ["Server", "Searches and assistant messages go to our server only to answer you. The server does not store them. Chat history lives in browser memory and is cleared when you close the chat."], ["Third parties", "Movie data and images come from TMDB. Streaming data comes from JustWatch. Song previews come from Apple. Trailers play from YouTube. Each has its own privacy policy."], ["Your choices", "Clear your browser data at any time to remove everything saved on your device."]] },
  terms: { t: "Terms of Use", b: [["Personal use", "FeelHub4u is for personal, non-commercial use."], ["Content", "Movies, songs, images and trailers belong to their owners. Do not copy, resell or redistribute them."], ["Changes", "The service is provided as is and may change at any time."]] },
  copyright: { t: "Copyright", b: [["Notice", "© 2026 FeelHub4u. The FeelHub4u name and logo belong to their owner."], ["Data credits", "This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming data by JustWatch. Song previews by Apple."]] }
};
const S = { view: "home", type: "trending", genres: "", lang: "", q: "", region: AREG, page: 1, pages: 1, chip: 0, term: SC[0][1] };
const M = {}, T = {}, root = document.documentElement, modal = $("modal"), audio = new Audio(), sx = $("sug"), chatHist = [];
let seq = 0, busy = false, now = "", tm, raf = 0, CUR = "";

// Storage helpers (browser only)
const LS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const SET = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Theme
const isDark = () => root.dataset.theme === "dark" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
function setTheme(t) {
  if (t === "auto") root.removeAttribute("data-theme"); else root.dataset.theme = t;
  localStorage.setItem("mf_theme", t);
  Q("#theme use").setAttribute("href", isDark() ? "#i-sun" : "#i-moon");
}
$("theme").onclick = () => setTheme(isDark() ? "light" : "dark");

// Toasts and connection status
function toast(msg, ic = "i-spark") {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<svg class="i"><use href="#${ic}"/></svg><span>${esc(msg)}</span>`;
  $("toasts").append(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 450); }, 2600);
}
addEventListener("offline", () => toast("You are offline", "i-alert"));
addEventListener("online", () => toast("Back online", "i-spark"));

// Saved list, remembered movies and recent searches
const listGet = () => LS("fh_list", []);
const inList = id => listGet().some(x => String(x.id) === String(id));
const remember = list => list.forEach(m => { if (m && m.id != null) M[m.id] = m; });
function toggleList(m) {
  if (!m) return;
  const on = !inList(m.id);
  const l = on ? [{ id: m.id, title: m.title, year: m.year, poster: m.poster, rating: m.rating, lang: m.lang, date: m.date }, ...listGet()] : listGet().filter(x => String(x.id) !== String(m.id));
  SET("fh_list", l.slice(0, 200));
  toast(on ? "Saved to My list" : "Removed from My list", on ? "i-heart" : "i-x");
  QA(`[data-fav="${m.id}"]`).forEach(b => {
    b.classList.toggle("on", on);
    const s = b.querySelector("span");
    if (s) s.textContent = on ? "Saved" : "Save";
  });
  if (S.view === "list") renderList();
}
function addRecent(q) { SET("fh_recent", [q, ...LS("fh_recent", []).filter(x => x !== q)].slice(0, 6)); }
function learn(names) {
  const f = LS("fh_gen", {});
  names.forEach(n => { const id = GID[n]; if (id) f[id] = (f[id] || 0) + 1; });
  SET("fh_gen", f);
}
function moodPick() {
  const top = Object.entries(LS("fh_gen", {})).sort((a, b) => b[1] - a[1])[0];
  if (top) return { label: "because you watch this genre", g: top[0] };
  const h = new Date().getHours();
  return h < 6 || h >= 22 ? { label: "late-night thrillers", g: "27|53" }
    : h < 12 ? { label: "morning lift", g: "35|16" }
    : h < 18 ? { label: "afternoon adventure", g: "28|12" }
    : { label: "evening romance", g: "10749|18" };
}

// Countdown boxes for upcoming releases
const cdParts = d => {
  const ms = new Date(d + "T00:00:00") - Date.now();
  if (!d || isNaN(ms)) return null;
  if (ms <= 0) return "out";
  return [Math.floor(ms / 864e5), Math.floor(ms % 864e5 / 36e5), Math.floor(ms % 36e5 / 6e4)];
};
const cdHtml = d => {
  const p = cdParts(d);
  if (!p) return "";
  if (p === "out") return `<div class="cdk-out">Out now</div>`;
  return `<div class="cdk">${[["days", p[0]], ["hrs", p[1]], ["min", p[2]]].map(([u, v]) => `<span><b>${String(v).padStart(2, "0")}</b>${u}</span>`).join("")}</div>`;
};

const isFut = d => { const t = new Date(d + "T00:00:00"); return !isNaN(t) && t > Date.now(); };

// Building blocks
const skel = () => Array.from({ length: 8 }, () => '<div class="skel"><div class="sk"></div></div>').join("");
const empty = (t, x) => `<div class="empty-s"><div class="ghost"><svg class="i"><use href="#i-film"/></svg></div><h3>${esc(t)}</h3><p>${esc(x)}</p></div>`;
const errCard = (msg, act) => `<div class="err" role="alert"><div class="err-ic"><svg class="i"><use href="#i-alert"/></svg></div><h3>Something went off-screen</h3><p>${esc(navigator.onLine ? msg : "You are offline. Reconnect and try again.")}</p><button class="btnp" data-retry="${esc(act)}"><svg class="i"><use href="#i-refresh"/></svg>Try again</button></div>`;
const ok = x => x.status === "fulfilled" ? x.value : [];
const card = (m, i, cd) => `<article class="card movie" tabindex="0" data-kind="movie" data-id="${m.id}" style="--i:${i % 12}">
  <div class="poster">${m.poster ? `<img loading="lazy" src="${IMG}w500${m.poster}" alt="">` : `<div class="noimg">${esc(m.title)}</div>`}
    <span class="badge"><svg class="i f"><use href="#i-star"/></svg>${Number(m.rating || 0).toFixed(1)}</span>
    <button class="fav${inList(m.id) ? " on" : ""}" data-fav="${m.id}" aria-label="Save to My list"><svg class="i"><use href="#i-heart"/></svg></button>
    ${cd ? `<div class="cdw"><small>Releases in</small><span class="cdt" data-date="${esc(m.date)}">${cdLive(m.date)}</span></div>` : ""}
  </div>
  <div class="meta"><h3>${esc(m.title)}</h3><p>${esc(m.year || "—")} · ${esc(String(m.lang || "").toUpperCase())}</p></div></article>`;
const songCard = (t, i) => `<article class="card song" tabindex="0" data-kind="song" data-id="${t.id}" style="--i:${i % 12}">
  <div class="poster">${t.art ? `<img loading="lazy" src="${esc(t.art)}" alt="">` : `<div class="noimg"><svg class="i"><use href="#i-music"/></svg></div>`}
    <span class="play"><svg class="i f"><use href="#i-play"/></svg></span></div>
  <div class="meta"><h3>${esc(t.title)}</h3><p>${esc(t.artist)}</p></div></article>`;
const rail = (title, items, v, cd) => items.length ? `<section class="row"><h2>${title}${v ? `<a data-v="${v}">See all →</a>` : ""}</h2><div class="rail">${items.map((m, i) => m.artist !== undefined ? songCard(m, i) : card(m, i, cd)).join("")}</div></section>` : "";

// Data
async function listApi(page) {
  const r = await fetch("/api/movies?" + new URLSearchParams(S.view === "upcoming" ? dateParams(page) : { type: S.type, genres: S.genres, q: S.q, lang: S.lang, page, loc: LOC, region: S.region }));
  const d = await r.json();
  if (!r.ok) throw new Error(d.error);
  return d;
}
const get = p => fetch("/api/movies?" + new URLSearchParams({ page: 1, q: "", genres: "", lang: "", loc: LOC, region: S.region, ...p }))
  .then(r => r.json().then(d => { if (!r.ok) throw new Error(); remember(d.results); return d.results; }));
async function songsOf(term) {
  const r = await fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=36&term=${encodeURIComponent(term)}`);
  const d = await r.json();
  return (d.results || []).filter(x => x.trackName).map(x => {
    const t = { id: x.trackId, title: x.trackName, artist: x.artistName || "", art: (x.artworkUrl100 || "").replace("100x100bb", "300x300bb"), preview: x.previewUrl || "", url: x.trackViewUrl || "" };
    T[t.id] = t;
    return t;
  });
}

// Navigation and search
function setNav() { QA(".pills [data-v], .dock [data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === S.view)); }
function go(v, o = {}) {
  Object.assign(S, { view: v, type: v === "upcoming" || v === "anime" ? v : "trending", genres: "", lang: "", q: "", page: 1, pages: 1, chip: 0, term: SC[0][1] }, o);
  if (!o.keepInput) $("q").value = S.q;
  sx.hidden = true;
  document.body.dataset.view = v;
  $("lang").value = S.lang;
  $("lang").hidden = v !== "movies";
  renderChips();
  setNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (v === "home") renderHome(); else if (v === "list") renderList(); else load(false);
}
function renderChips() {
  const c = $("chips");
  if (S.view === "movies") c.innerHTML = MC.map((x, i) => (i === 4 || i === 12 ? '<span class="sep"></span>' : "") + `<button class="chip" data-chip="${i}">${x[0]}</button>`).join("");
  else if (S.view === "upcoming") c.innerHTML = DT.map(([k, l]) => `<button class="chip" data-dt="${k}">${l}</button>`).join("");
  else if (S.view === "songs") c.innerHTML = SC.map((x, i) => `<button class="chip" data-chip="${i}">${x[0]}</button>`).join("");
  else c.innerHTML = "";
  c.hidden = !c.innerHTML;
  if (S.view === "upcoming") QA(".chip").forEach(el => el.classList.toggle("on", el.dataset.dt === (S.dt || "week"))); else markChip(S.chip);
}
function markChip(i) { QA(".chip").forEach((el, k) => el.classList.toggle("on", k === i)); }
$("chips").onclick = e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  if (b.dataset.dt) { S.dt = b.dataset.dt; QA(".chip").forEach(el => el.classList.toggle("on", el === b)); load(false); return; }
  S.chip = +b.dataset.chip;
  if (S.view === "movies") { S.type = MC[S.chip][1]; S.genres = MC[S.chip][2]; } else S.term = SC[S.chip][1];
  S.q = ""; $("q").value = ""; markChip(S.chip);
  load(false);
};
function smart(text) {
  let lang = "", genres = "";
  const rest = [];
  for (const w of text.toLowerCase().split(/\s+/).filter(Boolean)) {
    if (w === "anime") { lang = "ja"; genres = "16"; }
    else if (KW[w]) { /^[a-z]{2}$/.test(KW[w]) ? lang = KW[w] : genres = KW[w]; }
    else rest.push(w);
  }
  go("movies", { type: "trending", q: rest.join(" "), lang, genres, chip: -1, keepInput: true });
}
function runSearch(v) {
  if (!v) return;
  addRecent(v);
  sx.hidden = true;
  if (S.view === "songs") go("songs", { q: v, chip: -1, keepInput: true });
  else smart(v);
}
async function suggest(v) {
  try {
    const r = await fetch("/api/movies?" + new URLSearchParams({ q: v, loc: LOC, page: 1, region: "" }));
    const d = await r.json();
    if (!r.ok) throw new Error();
    remember(d.results.slice(0, 5));
    sx.innerHTML = `<div class="sg-h">Movies</div>` + (d.results.slice(0, 5).map((m, i) => `<button class="sg" style="--i:${i}" data-sg="${m.id}">${m.poster ? `<img src="${IMG}w92${m.poster}" alt="">` : `<span class="sg-n"></span>`}<span><b>${esc(m.title)}</b><small>${esc(m.year || "—")}</small></span></button>`).join("") || `<div class="sg-h">No matches</div>`);
    sx.hidden = false;
  } catch { sx.hidden = true; }
}
function showRecent() {
  const r = LS("fh_recent", []);
  sx.innerHTML = r.length
    ? `<div class="sg-h">Recent</div>` + r.map(x => `<button class="sg" data-recent="${esc(x)}"><span class="sg-n"><svg class="i"><use href="#i-clock"/></svg></span><span><b>${esc(x)}</b></span></button>`).join("")
    : `<div class="sg-h">Try “sad bangla”, “horror” or “anime”</div>`;
  sx.hidden = false;
}

// Loaders
async function load(more) {
  if (["home", "list"].includes(S.view) || (more && busy)) return;
  const my = ++seq;
  busy = true;
  try {
    if (S.view === "songs") await loadSongs(my);
    else await loadMovies(more, my);
  } catch {
    if (!more && my === seq) $("out").innerHTML = errCard("We could not load this list. Check your connection and try again.", "view");
  } finally {
    if (my === seq) busy = false;
  }
}
async function loadMovies(more, my) {
  if (S.view === "upcoming") return loadDated(more, my);
  if (!more) $("out").innerHTML = `<div class="grid" id="ge">${skel()}</div>`;
  const d = await listApi(more ? S.page + 1 : 1);
  if (my !== seq) return;
  S.page = d.page;
  S.pages = d.totalPages;
  remember(d.results);
  const cd = S.type === "upcoming";
  const html = d.results.map((m, i) => card(m, i, cd)).join("");
  if (more) { if (html) $("ge").insertAdjacentHTML("beforeend", html); }
  else $("out").innerHTML = d.results.length ? `<div class="grid" id="ge">${html}</div>` : empty("Nothing found", "Try another word, a mood, or a different language.");
}
async function loadSongs(my) {
  $("out").innerHTML = `<div class="grid">${skel()}</div>`;
  const list = await songsOf(S.q || S.term);
  if (my !== seq) return;
  $("out").innerHTML = list.length ? `<div class="grid">${list.map(songCard).join("")}</div>` : empty("No songs found", "Try another artist, song or mood.");
  markPlaying();
}
const io = new IntersectionObserver(es => {
  if (es[0].isIntersecting && S.page < S.pages && ["movies", "upcoming", "anime"].includes(S.view)) load(true);
}, { rootMargin: "600px" });
io.observe($("sent"));

// Dated releases: Today, This week, Coming soon, Latest released
const DT = [["today", "Today"], ["week", "This week"], ["soon", "Coming soon"], ["latest", "Latest released"]];
const DR = { today: [0, 0, "asc"], week: [0, 7, "asc"], soon: [1, 120, "asc"], latest: [-45, -1, "desc"] };
const ymd = n => { const x = new Date(); x.setDate(x.getDate() + n); return [x.getFullYear(), String(x.getMonth() + 1).padStart(2, "0"), String(x.getDate()).padStart(2, "0")].join("-"); };
const dateParams = page => { const [a, b, s] = DR[S.dt || "week"]; return { type: "dated", from: ymd(a), to: ymd(b), sort: s, page, loc: LOC }; };
let ACC = [];
async function loadDated(more, my) {
  if (!more) { ACC = []; $("out").innerHTML = `<div class="grid" id="ge">${skel()}</div>`; }
  const d = await listApi(more ? S.page + 1 : 1);
  if (my !== seq) return;
  S.page = d.page; S.pages = d.totalPages;
  remember(d.results);
  ACC = more ? ACC.concat(d.results) : d.results;
  $("out").innerHTML = ACC.length ? groupByDate(ACC) : empty("Nothing in this range", "Try another range above, or check back later.");
}
function dayLabel(k) {
  if (k === "tba") return "Date to be announced";
  const t = new Date(k + "T00:00:00"), n = new Date(); n.setHours(0, 0, 0, 0);
  const diff = Math.round((t - n) / 864e5);
  return diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : diff === -1 ? "Yesterday" : t.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
function groupByDate(list) {
  const by = {};
  list.forEach(m => { const k = m.date || "tba"; (by[k] = by[k] || []).push(m); });
  const keys = Object.keys(by).sort((a, b) => a === "tba" ? 1 : b === "tba" ? -1 : S.dt === "latest" ? b.localeCompare(a) : a.localeCompare(b));
  return keys.map(k => `<section class="dgrp"><h3 class="dh">${dayLabel(k)}<span>${by[k].length} ${by[k].length > 1 ? "films" : "film"}</span></h3><div class="grid">${by[k].map((m, i) => card(m, i, S.dt !== "latest")).join("")}</div></section>`).join("");
}
const cdLive = d => {
  const p = new Date(d + "T00:00:00") - Date.now();
  if (!d || isNaN(p)) return "";
  if (p <= 0) return new Date(d + "T00:00:00").toDateString() === new Date().toDateString() ? "Out today" : "Released";
  const s = Math.floor(p / 1000), D = Math.floor(s / 86400), H = Math.floor(s % 86400 / 3600), Mi = Math.floor(s % 3600 / 60), Se = s % 60;
  return `${D}d ${String(H).padStart(2, "0")}h ${String(Mi).padStart(2, "0")}m ${String(Se).padStart(2, "0")}s`;
};
setInterval(() => QA(".cdt").forEach(el => el.textContent = cdLive(el.dataset.date)), 1000);

// Pages
function renderList() {
  const l = listGet();
  remember(l);
  $("out").innerHTML = l.length
    ? `<div class="grid" id="ge">${l.map((m, i) => card(m, i, isFut(m.date))).join("")}</div>`
    : empty("Your list is empty", "Tap the heart on any movie to save it here. Upcoming releases show a live countdown.");
}
async function renderHome() {
  const mood = moodPick();
  $("out").innerHTML = `<section class="hero" id="hero"><div class="hb" id="hb"></div><div class="hero-in"><div>
      <span class="kicker">Movies · Anime · Songs</span>
      <h1>Find your next <span>favourite</span> film or song</h1>
      <p>Trending films, upcoming releases with live countdowns, anime, trailers, cast and instant song previews, all in one place.</p>
      <div class="cta"><button class="btnp" data-v="movies">Browse movies</button><button class="btng" data-v="surprise"><svg class="i"><use href="#i-shuffle"/></svg>Surprise me</button><button class="btng" data-v="chat"><svg class="i"><use href="#i-chat"/></svg>Ask the assistant</button></div>
    </div><div class="hero-card" id="hc" hidden></div></div></section><div id="rows"></div>`;
  const [t, u, tp, a, mo, so] = await Promise.allSettled([
    get({ type: "trending" }), get({ type: "upcoming" }), get({ type: "top" }), get({ type: "anime" }),
    get({ genres: mood.g, type: "trending" }), songsOf("top hits")
  ]);
  const f = ok(t).find(x => x.backdrop) || ok(t)[0], hc = $("hc");
  hc.hidden = !f;
  if (f && f.backdrop) $("hb").style.backgroundImage = `url(${IMG}w1280${f.backdrop})`;
  if (f) hc.innerHTML = `${f.poster ? `<img src="${IMG}w500${f.poster}" alt="">` : ""}<span class="hc-tag">Featured</span><div class="hc-info"><h3>${esc(f.title)}</h3><div class="hc-meta"><span class="badge"><svg class="i f"><use href="#i-star"/></svg>${f.rating.toFixed(1)}</span><span>${esc(f.year || "—")}</span></div><p class="hc-ov">${esc(f.overview)}</p><button class="btnp" data-open="${f.id}">View details</button></div>`;
  if (![t, u, tp, a, mo].some(x => ok(x).length)) { $("rows").innerHTML = errCard("We could not load the home page. Check your connection.", "home"); return; }
  $("rows").innerHTML =
    rail("Trending this week", ok(t), "movies") +
    rail("Coming soon · live countdown", ok(u), "upcoming", true) +
    rail(`Picked for you · ${mood.label}`, ok(mo), "movies") +
    rail("Top rated", ok(tp), "movies") +
    rail("Anime", ok(a), "anime") +
    rail("Trending songs", ok(so), "songs") +
    (listGet().length ? rail("My list", listGet(), "list") : "");
}
async function surprise() {
  try {
    const r = await fetch("/api/movies?" + new URLSearchParams({ type: "top", page: 1 + Math.floor(Math.random() * 8), q: "", genres: "", lang: "", loc: LOC, region: S.region }));
    const d = await r.json();
    if (!r.ok || !d.results.length) return toast("Nothing to pick right now", "i-alert");
    openMovie(d.results[Math.floor(Math.random() * d.results.length)].id);
  } catch { toast("Could not pick a movie", "i-alert"); }
}

// Movie details
function prov(p) {
  if (!p) return '<p class="muted">Streaming data is not available for this country yet.</p>';
  const rows = [["flatrate", "Stream"], ["rent", "Rent"], ["buy", "Buy"]]
    .filter(([k]) => p[k] && p[k].length)
    .map(([k, l]) => `<div class="prow"><b>${l}</b><div>${p[k].map(x => `<span class="pchip">${x.logo ? `<img src="${IMG}w45${x.logo}" alt="">` : ""}${esc(x.name)}</span>`).join("")}</div></div>`)
    .join("");
  return rows || '<p class="muted">Not streaming right now in this country.</p>';
}
async function openMovie(id) {
  const b = $("mbody");
  b.innerHTML = '<div class="bd"></div><div class="in"><div class="sk" style="height:220px;border-radius:24px"></div></div>';
  modal.classList.add("open");
  try {
    const r = await fetch(`/api/movie/${id}?` + new URLSearchParams({ region: S.region, loc: LOC }));
    const d = await r.json();
    if (!r.ok) throw new Error();
    learn(d.genres);
    CUR = id;
    remember([d]);
    const yt = "https://www.youtube.com/results?search_query=" + encodeURIComponent(d.title + " official trailer");
    const castHtml = d.cast.map(c => `<div class="cc">${c.photo ? `<img src="${IMG}w185${c.photo}" alt="">` : `<span></span>`}<b>${esc(c.name)}</b><small>${esc(c.role)}</small></div>`).join("");
    b.innerHTML = `<div class="bd" style="${d.backdrop ? `background-image:url(${IMG}w1280${d.backdrop})` : ""}"></div>
      <div class="in">
        <div class="mhead">${d.poster ? `<img class="mp" src="${IMG}w342${d.poster}" alt="">` : ""}<div>
          <h2>${esc(d.title)}</h2>
          <div class="sub">★ ${d.rating.toFixed(1)} · ${esc(d.year || "—")}${d.runtime ? ` · ${d.runtime} min` : ""}</div>
          <div class="tags">${d.genres.map(g => `<span>${esc(g)}</span>`).join("")}</div>
          <div class="acts">
            <button class="btnp" data-soundtrack="${esc(d.title)}"><svg class="i"><use href="#i-music"/></svg>Songs</button>
            <button class="btng fav-b${inList(d.id) ? " on" : ""}" data-fav="${d.id}"><svg class="i"><use href="#i-heart"/></svg><span>${inList(d.id) ? "Saved" : "Save"}</span></button>
            ${d.link ? `<a class="btng" target="_blank" rel="noopener noreferrer" href="${esc(d.link)}"><svg class="i"><use href="#i-tv"/></svg>All options</a>` : ""}
          </div>
        </div></div>
        <p class="lead">${esc(d.overview || "No description available.")}</p>
        ${d.trailer ? `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${d.trailer}" title="Trailer" allowfullscreen loading="lazy"></iframe></div>` : `<p class="muted">Trailer not available here. <a href="${yt}" target="_blank" rel="noopener">Search trailer on YouTube</a></p>`}
        ${d.cast.length ? `<h4>Cast</h4><div class="cast">${castHtml}</div>` : ""}
        <div class="wh"><h4>Where to watch</h4><select id="rsel" class="rsel" aria-label="Country">${regOpts(S.region)}</select></div>
        ${S.region ? prov(d.providers) : '<p class="muted">Choose a country to see where to watch.</p>'}
        ${rail("More like this", d.similar, "", false)}
      </div>`;
  } catch {
    b.innerHTML = `<div class="in">${errCard("Details are not available right now.", "movie:" + id)}</div>`;
  }
}
function openInfo(k) {
  const x = INFO[k];
  $("mbody").innerHTML = `<div class="pad"><span class="kicker">Information</span><h2>${x.t}</h2>${x.b.map(([h, p]) => `<section class="ib2"><h4>${esc(h)}</h4><p class="lead">${esc(p)}</p></section>`).join("")}</div>`;
  modal.classList.add("open");
}
const closeModal = () => { modal.classList.remove("open"); $("mbody").innerHTML = ""; };

// Assistant panel: chat lives in memory only and is cleared on close
function openChat() {
  $("chat").classList.add("open");
  if (!$("cmsgs").children.length) addMsg("a", "Hi! Ask me for a mood, a language or a genre. Indian movies come first. This chat clears when you close the panel.");
  setTimeout(() => $("cin").focus(), 350);
}
function closeChat() { $("chat").classList.remove("open"); chatHist.length = 0; $("cmsgs").innerHTML = ""; }
function addMsg(role, text, typing) {
  const d = document.createElement("div");
  d.className = `b ${role}${typing ? " typing" : ""}`;
  if (typing) d.innerHTML = "<i></i><i></i><i></i>"; else d.textContent = text;
  $("cmsgs").append(d);
  $("cmsgs").scrollTop = 1e9;
  return d;
}
async function sendChat(text) {
  addMsg("u", text);
  chatHist.push({ role: "user", content: text });
  const wait = addMsg("a", "", true);
  try {
    const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: chatHist.slice(-10) }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    wait.remove();
    addMsg("a", d.reply);
    chatHist.push({ role: "assistant", content: d.reply });
    if (d.picks && d.picks.length) {
      remember(d.picks);
      $("cmsgs").insertAdjacentHTML("beforeend", `<div class="cpicks">${d.picks.map(m => `<button class="cp" data-open="${m.id}">${m.poster ? `<img src="${IMG}w185${m.poster}" alt="">` : ""}<span>${esc(m.title)}</span></button>`).join("")}</div>`);
      $("cmsgs").scrollTop = 1e9;
    }
  } catch {
    wait.remove();
    addMsg("a", "Sorry, I could not answer right now. Please try again in a moment.");
  }
}

// Song player with progress and platform links
const fmt = s => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";
function playSong(t) {
  if (!t) return;
  if (!t.preview) { window.open(t.url, "_blank", "noopener"); return; }
  if (now === String(t.id)) { audio.paused ? audio.play().catch(() => {}) : audio.pause(); return; }
  now = String(t.id);
  audio.src = t.preview;
  audio.play().catch(() => {});
  $("npArt").hidden = !t.art;
  if (t.art) $("npArt").src = t.art;
  $("npT").textContent = t.title;
  $("npA").textContent = t.artist;
  const q = encodeURIComponent(`${t.title} ${t.artist}`);
  $("npL").innerHTML = `<a href="${esc(t.url)}" target="_blank" rel="noopener">Apple Music</a><a href="https://open.spotify.com/search/${q}" target="_blank" rel="noopener">Spotify</a><a href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">YouTube</a>`;
  $("np").hidden = false;
}
function markPlaying() { QA(".card.song").forEach(c => c.classList.toggle("playing", c.dataset.id === now && !audio.paused)); }
function syncPlay() {
  Q("#npBtn use").setAttribute("href", audio.paused ? "#i-play" : "#i-pause");
  markPlaying();
}
audio.ontimeupdate = () => { $("prog").style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + "%"; $("tcur").textContent = fmt(audio.currentTime); };
audio.onloadedmetadata = () => { $("tdur").textContent = fmt(audio.duration); };
audio.onplay = audio.onpause = audio.onended = syncPlay;
$("pbar").onclick = e => { if (!audio.duration) return; const r = e.currentTarget.getBoundingClientRect(); audio.currentTime = (e.clientX - r.left) / r.width * audio.duration; };
$("npBtn").onclick = () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); };

// Global events
document.addEventListener("click", e => {
  const t = e.target;
  const fav = t.closest("[data-fav]");
  if (fav) { e.preventDefault(); toggleList(M[fav.dataset.fav]); return; }
  const rt = t.closest("[data-retry]");
  if (rt) { const a = rt.dataset.retry; a === "home" ? go("home") : a.startsWith("movie:") ? openMovie(a.slice(6)) : go(S.view); return; }
  const op = t.closest("[data-open]");
  if (op) { openMovie(op.dataset.open); return; }
  const sg = t.closest("[data-sg]");
  if (sg) { sx.hidden = true; $("q").value = ""; openMovie(sg.dataset.sg); return; }
  const rc = t.closest("[data-recent]");
  if (rc) { $("q").value = rc.dataset.recent; runSearch(rc.dataset.recent); return; }
  const cq = t.closest("[data-cq]");
  if (cq) { sendChat(cq.dataset.cq); return; }
  if (!t.closest(".sx")) sx.hidden = true;
  const v = t.closest("[data-v]");
  if (v) {
    e.preventDefault();
    const x = v.dataset.v;
    x === "surprise" ? surprise() : x === "chat" ? openChat() : go(x);
    return;
  }
  const f = t.closest("[data-info]");
  if (f) { openInfo(f.dataset.info); return; }
  const c = t.closest(".card");
  if (c) c.dataset.kind === "song" ? playSong(T[c.dataset.id]) : openMovie(c.dataset.id);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); sx.hidden = true; closeChat(); }
  if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); $("q").focus(); }
  if (e.key === "Enter" && e.target.classList && e.target.classList.contains("card")) e.target.click();
  if (e.target.id === "q" && e.key === "Enter") runSearch($("q").value.trim());
});
$("q").oninput = e => { clearTimeout(tm); const v = e.target.value.trim(); $("sclr").hidden = !e.target.value; tm = setTimeout(() => v ? suggest(v) : showRecent(), 220); };
$("sclr").onclick = () => { $("q").value = ""; $("sclr").hidden = true; $("q").focus(); showRecent(); };
const PH = ["sad bangla", "horror thriller", "anime", "Indian romance", "feel-good comedy"];
let phi = 0;
setInterval(() => { phi = (phi + 1) % PH.length; if (document.activeElement !== $("q")) $("q").placeholder = `Search · try “${PH[phi]}”`; }, 2600);
$("q").onfocus = () => { if (!$("q").value.trim()) showRecent(); };
$("lang").onchange = () => { S.lang = $("lang").value; load(false); };
$("cclose").onclick = closeChat;
$("cform").onsubmit = e => { e.preventDefault(); const v = $("cin").value.trim(); if (!v) return; $("cin").value = ""; sendChat(v); };
$("close").onclick = closeModal;
modal.onclick = e => { if (e.target === modal) closeModal(); };
$("mbody").onclick = e => {
  const b = e.target.closest("[data-soundtrack]");
  if (!b) return;
  const t = b.dataset.soundtrack;
  closeModal();
  go("songs", { q: t + " soundtrack", chip: -1 });
};
$("mbody").onchange = e => { if (e.target.id === "rsel") { S.region = e.target.value; openMovie(CUR); } };
addEventListener("pointermove", e => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => { root.style.setProperty("--mx", e.clientX + "px"); root.style.setProperty("--my", e.clientY + "px"); });
  const c = e.target.closest ? e.target.closest(".card.movie") : null;
  if (c && e.pointerType !== "touch") {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-6px)`;
  }
}, { passive: true });
document.addEventListener("pointerout", e => {
  const c = e.target.closest ? e.target.closest(".card.movie") : null;
  if (c && !c.contains(e.relatedTarget)) c.style.transform = "";
});

// Press ripple on buttons, chips, cards and suggestions
document.addEventListener("pointerdown", e => {
  const el = e.target.closest(".btnp,.btng,.chip,.pill,.ib,.dock button,.sg,.card,.cp");
  if (!el) return;
  const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement("span");
  s.className = "rp";
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  el.append(s);
  setTimeout(() => s.remove(), 700);
}, { passive: true });

// Start
setTheme(localStorage.getItem("mf_theme") || "auto");
go("home");
