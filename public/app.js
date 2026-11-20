const IMG = "https://image.tmdb.org/t/p/", $ = i => document.getElementById(i), Q = (s, r = document) => r.querySelector(s), QA = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const LOC = "en-US";
const CODES = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW";
const DN = (() => { try { return new Intl.DisplayNames(["en"], { type: "region" }); } catch { return null; } })();
const REG = CODES.split(" ").map(c => [c, (DN && DN.of(c)) || c]).sort((a, b) => a[1].localeCompare(b[1]));
const regOpts = sel => `<option value="">Select country</option>` + REG.map(([v, l]) => `<option value="${v}"${v === sel ? " selected" : ""}>${l}</option>`).join("");
const AREG = (() => { try { const r = new Intl.Locale(navigator.language).region; return REG.some(x => x[0] === r) ? r : ""; } catch { return ""; } })();
const LANGS = [["", "All languages"], ["hi", "Hindi"], ["bn", "Bangla"], ["ta", "Tamil"], ["te", "Telugu"], ["ml", "Malayalam"], ["kn", "Kannada"], ["mr", "Marathi"], ["pa", "Punjabi"], ["en", "English"], ["ko", "Korean"], ["ja", "Japanese"], ["zh", "Chinese"], ["th", "Thai"], ["es", "Spanish"], ["fr", "French"], ["tr", "Turkish"]];
const MC = [["Trending", "trending", ""], ["Top Rated", "top", ""], ["Upcoming", "upcoming", ""], ["Now Playing", "now", ""], ["Action", "", "28"], ["Comedy", "", "35"], ["Drama", "", "18"], ["Romance", "", "10749"], ["Thriller", "", "53"], ["Horror", "", "27"], ["Sci-Fi", "", "878"], ["Animation", "", "16"], ["Happy", "", "35|16|10751"], ["Sad", "", "18|10749"], ["Excited", "", "28|12|53"], ["Scared", "", "27|53"], ["Relaxed", "", "16|10751|14"], ["Thoughtful", "", "99|36|9648"]];
const TVC = [["Trending", "trending"], ["Top rated", "top"], ["On air", "onair"], ["Airing today", "airing"], ["Popular", "popular"]];
const SC = [["Top Hits", "top hits"], ["Bangla", "bangla songs"], ["Bollywood", "bollywood hits"], ["English Pop", "english pop hits"], ["Romantic", "romantic love songs"], ["Sad", "sad songs"], ["Party", "party dance hits"], ["Chill", "lofi chill"]];
const DT = [["today", "Today"], ["week", "This week"], ["soon", "Coming soon"], ["latest", "Latest released"]];
const DR = { today: [0, 0, "asc"], week: [0, 7, "asc"], soon: [1, 120, "asc"], latest: [-45, -1, "desc"] };
const GID = { Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80, Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36, Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, "Science Fiction": 878, Thriller: 53, War: 10752, Western: 37 };
const KW = { bangla: "bn", bengali: "bn", hindi: "hi", bollywood: "hi", indian: "hi", tamil: "ta", telugu: "te", malayalam: "ml", kannada: "kn", marathi: "mr", punjabi: "pa", korean: "ko", japanese: "ja", english: "en", spanish: "es", french: "fr", sad: "18|10749", cry: "18|10749", romantic: "10749", love: "10749", funny: "35", comedy: "35", scary: "27|53", horror: "27", thriller: "53", action: "28", kids: "10751|16", family: "10751", cartoon: "16", scifi: "878", "sci-fi": "878", war: "10752", history: "36", documentary: "99" };
const NAV = [["movies", "Movies", "i-film"], ["series", "Series", "i-tv"], ["songs", "Songs", "i-music"], ["anime", "Anime", "i-spark"], ["upcoming", "Releases", "i-cal"], ["list", "My list", "i-bookmark"]];
const INFO = {
  about: { t: "About FeelHub4u", b: [["What it is", "FeelHub4u helps you find movies, series, anime and songs in one place. See what is trending and coming soon, watch trailers, check where to stream and listen to song previews."], ["Built for", "Anyone who asks “what should I watch tonight?”, including fans of Indian, Bangla, anime and world cinema."]] },
  help: { t: "Help", b: [["Search", "Type plain words such as “sad bangla”, “horror” or “anime”, then press Enter. Recent searches appear when you click the search box."], ["Save", "Tap the heart on any title to save it to My list."], ["Trailers", "Press play on a trailer to watch it here. If it does not load, use Open on YouTube."], ["Where to watch", "Choose your country inside a title to see where it streams. Availability differs by country."], ["Assistant", "Ask for a mood, language or genre. Your chat clears when you close it."], ["Shortcuts", "Press / to search and Esc to close any window."]] },
  privacy: { t: "Privacy Policy", b: [["No accounts", "There are no accounts. Your saved list, theme, recent searches and age choice stay in your browser."], ["Our server", "Searches and assistant messages are sent to our server only to answer you. We do not store them. Chat history stays in your browser until you close the chat."], ["Third parties", "Movie and series data and images come from TMDB. Streaming data comes from JustWatch. Song previews come from Apple. Trailers play from YouTube. Each has its own privacy policy."], ["Your choices", "You can clear your browser data at any time to remove what is saved on your device."]] },
  terms: { t: "Terms of Use", b: [["Personal use", "FeelHub4u is for personal, non-commercial use."], ["Content", "Titles, songs, images and trailers belong to their owners. Please do not copy, resell or redistribute them."], ["Adult section", "The 18+ section is only for adults. You confirm your age before you enter it."], ["Changes", "The service is provided as is and may change at any time."]] },
  copyright: { t: "Copyright", b: [["Notice", "© 2026 FeelHub4u. The FeelHub4u name and logo belong to their owner."], ["Data credits", "This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming data by JustWatch. Song previews by Apple."]] }
};
const GRID = ["movies", "series", "anime", "upcoming", "adult"];
const S = { view: "home", type: "trending", genres: "", lang: "", q: "", region: AREG, page: 1, pages: 1, chip: 0, term: SC[0][1], dt: "week" };
const M = {}, T = {}, root = document.documentElement, modal = $("modal"), audio = new Audio(), sx = $("sug"), chatHist = [], HERO = { i: 0, n: 0 };
let seq = 0, busy = false, now = "", tm, raf = 0, CUR = "", CURK = "movie", ACC = [];

// Storage (browser only)
const LS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const SET = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const UID = LS("fh_uid", "") || (() => { const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); SET("fh_uid", id); return id; })();
const kindOf = m => m && m.kind === "tv" ? "tv" : "movie";
const ky = (k, id) => (k === "tv" ? "t" : "m") + id;

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
addEventListener("online", () => toast("You are back online", "i-spark"));

// Saved list, remembered titles, recent searches, taste
const listGet = () => LS("fh_list", []);
const inList = m => { const k = ky(kindOf(m), m.id); return listGet().some(x => ky(kindOf(x), x.id) === k); };
const remember = list => list.forEach(m => { if (m && m.id != null) M[ky(kindOf(m), m.id)] = m; });
function toggleList(m) {
  if (!m) return;
  const k = ky(kindOf(m), m.id), on = !inList(m);
  const l = on ? [{ id: m.id, kind: kindOf(m), title: m.title, year: m.year, poster: m.poster, rating: m.rating, lang: m.lang, date: m.date }, ...listGet()] : listGet().filter(x => ky(kindOf(x), x.id) !== k);
  SET("fh_list", l.slice(0, 200));
  toast(on ? "Saved to My list" : "Removed from My list", on ? "i-heart" : "i-x");
  QA(`[data-fav="${k}"]`).forEach(b => { b.classList.toggle("on", on); const s = b.querySelector("span"); if (s) s.textContent = on ? "Saved" : "Save"; });
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
  if (top) return { label: "because you like this genre", g: top[0] };
  const h = new Date().getHours();
  return h < 6 || h >= 22 ? { label: "late-night thrillers", g: "27|53" }
    : h < 12 ? { label: "morning lift", g: "35|16" }
    : h < 18 ? { label: "afternoon adventure", g: "28|12" }
    : { label: "evening romance", g: "10749|18" };
}

// Live countdown: boxes for days, hours, minutes and seconds
const cdParts = d => {
  const p = new Date(d + "T00:00:00") - Date.now();
  if (!d || isNaN(p) || p <= 0) return null;
  const s = Math.floor(p / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
};
const cdNow = d => `<div class="cdnow">${new Date(d + "T00:00:00").toDateString() === new Date().toDateString() ? "Out today" : "Out now"}</div>`;
const cdBoxes = d => { const p = cdParts(d) || { d: 0, h: 0, m: 0, s: 0 }; return `<div class="cbs">${[["d", "days"], ["h", "hrs"], ["m", "min"], ["s", "sec"]].map(([k, l]) => `<span class="cb"><b data-k="${k}">${pad(p[k])}</b><i>${l}</i></span>`).join("")}</div>`; };
const cdHtml = d => cdParts(d) ? cdBoxes(d) : cdNow(d);
function tickCd() {
  QA(".cdw[data-date]").forEach(el => {
    const d = el.dataset.date, p = cdParts(d);
    if (!p) { if (el.dataset.st !== "now") { el.dataset.st = "now"; el.innerHTML = cdNow(d); } return; }
    if (!el.querySelector(".cbs")) { el.dataset.st = "box"; el.innerHTML = cdBoxes(d); return; }
    ["d", "h", "m", "s"].forEach(k => {
      const b = el.querySelector(`[data-k="${k}"]`), v = pad(p[k]);
      if (b && b.textContent !== v) { b.textContent = v; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
    });
  });
}
setInterval(tickCd, 1000);
const isFut = d => { const t = new Date(d + "T00:00:00"); return !isNaN(t) && t > Date.now(); };

// Building blocks
const skel = () => Array.from({ length: 8 }, () => '<div class="skel"><div class="sk"></div></div>').join("");
const empty = (t, x) => `<div class="empty-s"><div class="ghost"><svg class="i"><use href="#i-film"/></svg></div><h3>${esc(t)}</h3><p>${esc(x)}</p></div>`;
const errCard = (msg, act) => `<div class="err" role="alert"><div class="err-ic"><svg class="i"><use href="#i-alert"/></svg></div><h3>Something didn't load</h3><p>${esc(navigator.onLine ? msg : "You are offline. Reconnect and try again.")}</p><button class="btnp" data-retry="${esc(act)}"><svg class="i"><use href="#i-refresh"/></svg>Try again</button></div>`;
const ok = x => x.status === "fulfilled" ? x.value : [];
const card = (m, i, cd) => {
  const k = kindOf(m), key = ky(k, m.id);
  return `<article class="card movie" tabindex="0" data-kind="${k}" data-key="${key}" style="--i:${i % 12}">
  <div class="poster">${m.poster ? `<img loading="lazy" src="${IMG}w500${m.poster}" alt="">` : `<div class="noimg">${esc(m.title)}</div>`}
    <span class="badge"><svg class="i f"><use href="#i-star"/></svg>${Number(m.rating || 0).toFixed(1)}</span>
    <button class="fav${inList(m) ? " on" : ""}" data-fav="${key}" aria-label="Save to My list"><svg class="i"><use href="#i-heart"/></svg></button>
    ${cd && m.date ? `<div class="cdw" data-date="${esc(m.date)}">${cdHtml(m.date)}</div>` : ""}
  </div>
  <div class="meta"><h3>${esc(m.title)}</h3><p>${esc(m.year || "—")}${k === "tv" ? " · Series" : ""} · ${esc(String(m.lang || "").toUpperCase())}</p></div></article>`;
};
const songCard = (t, i) => `<article class="card song" tabindex="0" data-kind="song" data-id="${t.id}" style="--i:${i % 12}">
  <div class="poster">${t.art ? `<img loading="lazy" src="${esc(t.art)}" alt="">` : `<div class="noimg"><svg class="i"><use href="#i-music"/></svg></div>`}
    <span class="play"><svg class="i f"><use href="#i-play"/></svg></span></div>
  <div class="meta"><h3>${esc(t.title)}</h3><p>${esc(t.artist)}</p></div></article>`;
const rail = (title, items, v, cd) => items.length ? `<section class="row"><h2>${title}${v ? `<a data-v="${v}">See all →</a>` : ""}</h2><div class="rail">${items.map((m, i) => m.artist !== undefined ? songCard(m, i) : card(m, i, cd)).join("")}</div></section>` : "";

// Data
async function fetchPage(page) {
  const v = S.view;
  let url;
  if (v === "series") url = "/api/tv?" + new URLSearchParams({ type: S.type, genres: S.genres, q: S.q, page, loc: LOC });
  else if (v === "upcoming") url = "/api/movies?" + new URLSearchParams(dateParams(page));
  else url = "/api/movies?" + new URLSearchParams({ type: v === "adult" ? "adult" : v === "anime" ? "anime" : S.type, genres: S.genres, q: S.q, lang: S.lang, page, loc: LOC, region: S.region });
  const r = await fetch(url);
  const d = await r.json();
  if (!r.ok) throw new Error(d.error);
  return d;
}
const getM = p => fetch("/api/movies?" + new URLSearchParams({ page: 1, q: "", genres: "", lang: "", loc: LOC, region: S.region, ...p }))
  .then(r => r.json().then(d => { if (!r.ok) throw new Error(); remember(d.results); return d.results; }));
const getT = p => fetch("/api/tv?" + new URLSearchParams({ page: 1, q: "", genres: "", loc: LOC, ...p }))
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
const ymd = n => { const x = new Date(); x.setDate(x.getDate() + n); return [x.getFullYear(), pad(x.getMonth() + 1), pad(x.getDate())].join("-"); };
const dateParams = page => { const [a, b, s] = DR[S.dt || "week"]; return { type: "dated", from: ymd(a), to: ymd(b), sort: s, page, loc: LOC }; };

// Navigation
function renderPills() {
  const on = LS("fh_18", false);
  $("pills").innerHTML = NAV.map(([v, l, ic]) => `<button class="pill" data-v="${v}"><svg class="i"><use href="#${ic}"/></svg>${l}</button>`).join("")
    + (on ? `<button class="pill adult" data-v="adult"><svg class="i"><use href="#i-shield"/></svg>18+</button>` : "");
  setNav();
}
function setNav() { QA(".pills [data-v], .dock [data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === S.view)); }
function go(v, o = {}) {
  Object.assign(S, { view: v, type: v === "anime" ? "anime" : v === "adult" ? "adult" : "trending", genres: "", lang: "", q: "", page: 1, pages: 1, chip: 0, term: SC[0][1] }, o);
  if (!o.keepInput) $("q").value = S.q;
  sx.hidden = true;
  document.body.dataset.view = v;
  $("adultbar").hidden = v !== "adult";
  $("lang").value = S.lang;
  $("lang").hidden = !(v === "movies" || v === "anime");
  renderChips();
  setNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (v === "home") renderHome(); else if (v === "list") renderList(); else load(false);
}
function renderChips() {
  const c = $("chips"), v = S.view;
  const btn = (l, i) => `<button class="chip" data-chip="${i}">${l}</button>`;
  if (v === "movies") c.innerHTML = MC.map((x, i) => (i === 4 || i === 12 ? '<span class="sep"></span>' : "") + btn(x[0], i)).join("");
  else if (v === "series") c.innerHTML = TVC.map((x, i) => btn(x[0], i)).join("");
  else if (v === "songs") c.innerHTML = SC.map((x, i) => btn(x[0], i)).join("");
  else if (v === "upcoming") c.innerHTML = DT.map(([k, l]) => `<button class="chip" data-dt="${k}">${l}</button>`).join("");
  else c.innerHTML = "";
  c.hidden = !c.innerHTML;
  if (v === "upcoming") QA(".chip").forEach(el => el.classList.toggle("on", el.dataset.dt === (S.dt || "week")));
  else markChip(S.chip);
}
function markChip(i) { QA(".chip").forEach((el, k) => el.classList.toggle("on", k === i)); }
$("chips").onclick = e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  if (b.dataset.dt) { S.dt = b.dataset.dt; QA(".chip").forEach(el => el.classList.toggle("on", el === b)); load(false); return; }
  S.chip = +b.dataset.chip;
  if (S.view === "movies") { S.type = MC[S.chip][1]; S.genres = MC[S.chip][2]; }
  else if (S.view === "series") { S.type = TVC[S.chip][1]; S.genres = ""; }
  else S.term = SC[S.chip][1];
  S.q = ""; $("q").value = "";
  markChip(S.chip);
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
  else if (S.view === "series") go("series", { q: v, chip: -1, keepInput: true });
  else smart(v);
}
async function suggest(v) {
  try {
    const r = await fetch("/api/movies?" + new URLSearchParams({ q: v, loc: LOC, page: 1, region: "" }));
    const d = await r.json();
    if (!r.ok) throw new Error();
    remember(d.results.slice(0, 5));
    sx.innerHTML = `<div class="sg-h">Movies</div>` + (d.results.slice(0, 5).map((m, i) => `<button class="sg" style="--i:${i}" data-sg="${ky("movie", m.id)}">${m.poster ? `<img src="${IMG}w92${m.poster}" alt="">` : `<span class="sg-n"></span>`}<span><b>${esc(m.title)}</b><small>${esc(m.year || "—")}</small></span></button>`).join("") || `<div class="sg-h">No matches yet</div>`);
    sx.hidden = false;
  } catch { sx.hidden = true; }
}
function showRecent() {
  const r = LS("fh_recent", []);
  sx.innerHTML = r.length
    ? `<div class="sg-h">Recent</div>` + r.map((x, i) => `<button class="sg" style="--i:${i}" data-recent="${esc(x)}"><span class="sg-n"><svg class="i"><use href="#i-clock"/></svg></span><span><b>${esc(x)}</b></span></button>`).join("")
    : `<div class="sg-h">Try “sad bangla”, “horror” or “anime”</div>`;
  sx.hidden = false;
}

// Loading
async function load(more) {
  if (S.view === "home" || S.view === "list" || (more && busy)) return;
  const my = ++seq;
  busy = true;
  try {
    if (S.view === "songs") await loadSongs(my);
    else await loadGrid(more, my);
  } catch {
    if (!more && my === seq) $("out").innerHTML = errCard("We couldn't load this list right now. Check your connection and try again.", "view");
  } finally {
    if (my === seq) busy = false;
  }
}
async function loadGrid(more, my) {
  if (!more) { ACC = []; $("out").innerHTML = `<div class="grid" id="ge">${skel()}</div>`; }
  const d = await fetchPage(more ? S.page + 1 : 1);
  if (my !== seq) return;
  S.page = d.page;
  S.pages = d.totalPages;
  remember(d.results);
  if (S.view === "upcoming") {
    ACC = more ? ACC.concat(d.results) : d.results;
    $("out").innerHTML = ACC.length ? groupByDate(ACC) : empty("Nothing in this range", "Try another range above, or check back later.");
    return;
  }
  const html = d.results.map((m, i) => card(m, i, false)).join("");
  if (more) { if (html) $("ge").insertAdjacentHTML("beforeend", html); }
  else $("out").innerHTML = d.results.length
    ? `<div class="grid" id="ge">${html}</div>`
    : S.view === "adult" ? empty("Nothing here yet", "Try again later, or search for a title.") : empty("Nothing found", "Try another word, a mood or a different language.");
}
async function loadSongs(my) {
  $("out").innerHTML = `<div class="grid">${skel()}</div>`;
  const list = await songsOf(S.q || S.term);
  if (my !== seq) return;
  $("out").innerHTML = list.length ? `<div class="grid">${list.map(songCard).join("")}</div>` : empty("No songs found", "Try another artist, song or mood.");
  markPlaying();
}
const io = new IntersectionObserver(es => {
  if (es[0].isIntersecting && S.page < S.pages && GRID.includes(S.view)) load(true);
}, { rootMargin: "600px" });
io.observe($("sent"));

// Release-date groups
function dayLabel(k) {
  if (k === "tba") return "Date to be announced";
  const t = new Date(k + "T00:00:00"), n = new Date();
  n.setHours(0, 0, 0, 0);
  const diff = Math.round((t - n) / 864e5);
  return diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : diff === -1 ? "Yesterday" : t.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}
function groupByDate(list) {
  const by = {};
  list.forEach(m => { const k = m.date || "tba"; (by[k] = by[k] || []).push(m); });
  const keys = Object.keys(by).sort((a, b) => a === "tba" ? 1 : b === "tba" ? -1 : S.dt === "latest" ? b.localeCompare(a) : a.localeCompare(b));
  return keys.map(k => `<section class="dgrp"><h3 class="dh">${dayLabel(k)}<span>${by[k].length} ${by[k].length > 1 ? "titles" : "title"}</span></h3><div class="grid">${by[k].map((m, i) => card(m, i, S.dt !== "latest")).join("")}</div></section>`).join("");
}

// Pages
function renderList() {
  const l = listGet();
  remember(l);
  $("out").innerHTML = l.length
    ? `<div class="grid" id="ge">${l.map((m, i) => card(m, i, kindOf(m) === "movie" && isFut(m.date))).join("")}</div>`
    : empty("Your list is empty", "Tap the heart on any title to save it here. Upcoming releases show a live countdown.");
}
async function renderHome() {
  const mood = moodPick();
  $("out").innerHTML = `<section class="hero" id="hero"><div id="hbs"></div><div class="hero-in"><div class="hero-txt">
      <span class="kicker">Movies · Series · Anime · Songs</span>
      <h1>Find your next <span>favourite</span> film or show</h1>
      <p>Trending films and series, upcoming releases with live countdowns, trailers, cast and instant song previews.</p>
      <div class="cta"><button class="btnp" data-v="movies">Browse movies</button><button class="btng" data-v="series">Browse series</button><button class="btng" data-v="surprise"><svg class="i"><use href="#i-shuffle"/></svg>Surprise me</button></div>
    </div><div class="hero-card" id="hc" hidden></div></div><div class="hdots" id="hdots"></div></section><div id="rows"></div>`;
  const [t, u, tv, tp, a, mo, so] = await Promise.allSettled([
    getM({ type: "trending" }), getM({ type: "upcoming" }), getT({ type: "trending" }), getM({ type: "top" }),
    getM({ type: "anime" }), getM({ genres: mood.g, type: "trending" }), songsOf("top hits")
  ]);
  const feat = ok(t).filter(x => x.backdrop).slice(0, 6);
  HERO.n = feat.length;
  HERO.i = 0;
  $("hbs").innerHTML = feat.map((f, i) => `<div class="hbs${i === 0 ? " on" : ""}" style="background-image:url(${IMG}w1280${f.backdrop})"></div>`).join("");
  $("hc").innerHTML = feat.map((f, i) => `<div class="hs${i === 0 ? " on" : ""}">${f.poster ? `<img src="${IMG}w500${f.poster}" alt="">` : ""}<span class="hc-tag">Featured</span><div class="hc-info"><h3>${esc(f.title)}</h3><div class="hc-meta"><span class="hc-r"><svg class="i f"><use href="#i-star"/></svg>${f.rating.toFixed(1)}</span><span>${esc(f.year || "—")}</span></div><p class="hc-ov">${esc(f.overview)}</p><button class="btnp" data-open="${ky("movie", f.id)}">View details</button></div></div>`).join("");
  $("hc").hidden = !feat.length;
  $("hdots").innerHTML = feat.length > 1 ? feat.map((f, i) => `<button data-slide="${i}" class="${i === 0 ? "on" : ""}" aria-label="Show ${i + 1}"></button>`).join("") : "";
  if (!feat.length) $("hero").hidden = true;
  if (![t, u, tv, tp, a, mo].some(x => ok(x).length)) { $("rows").innerHTML = errCard("We couldn't load the home page. Check your connection and try again.", "home"); return; }
  $("rows").innerHTML =
    rail("Trending movies", ok(t), "movies") +
    rail("Trending series", ok(tv), "series") +
    rail("Coming soon · live countdown", ok(u), "upcoming", true) +
    rail(`Picked for you · ${mood.label}`, ok(mo), "movies") +
    rail("Top rated", ok(tp), "movies") +
    rail("Anime", ok(a), "anime") +
    rail("Trending songs", ok(so), "songs") +
    (listGet().length ? rail("My list", listGet(), "list") : "");
}
function heroShow(i) {
  if (!HERO.n) return;
  HERO.i = (i + HERO.n) % HERO.n;
  QA(".hbs").forEach((el, k) => el.classList.toggle("on", k === HERO.i));
  QA(".hs").forEach((el, k) => el.classList.toggle("on", k === HERO.i));
  QA("#hdots button").forEach((el, k) => el.classList.toggle("on", k === HERO.i));
}
setInterval(() => {
  const h = $("hero");
  if (!h || S.view !== "home" || HERO.n < 2 || h.matches(":hover")) return;
  heroShow(HERO.i + 1);
}, 7000);
async function surprise() {
  try {
    const r = await fetch("/api/movies?" + new URLSearchParams({ type: "top", page: 1 + Math.floor(Math.random() * 8), q: "", genres: "", lang: "", loc: LOC, region: S.region }));
    const d = await r.json();
    if (!r.ok || !d.results.length) return toast("Nothing to pick right now", "i-alert");
    openDetails("movie", d.results[Math.floor(Math.random() * d.results.length)].id);
  } catch { toast("Could not pick a title right now", "i-alert"); }
}

// Title details (movies and series)
function prov(p) {
  if (!p) return '<p class="muted">Streaming information is not available for this country yet.</p>';
  const rows = [["flatrate", "Stream"], ["rent", "Rent"], ["buy", "Buy"]]
    .filter(([k]) => p[k] && p[k].length)
    .map(([k, l]) => `<div class="prow"><b>${l}</b><div>${p[k].map(x => `<span class="pchip">${x.logo ? `<img src="${IMG}w45${x.logo}" alt="">` : ""}${esc(x.name)}</span>`).join("")}</div></div>`)
    .join("");
  return rows || '<p class="muted">Not streaming right now in this country.</p>';
}
function openKey(key) { openDetails(key[0] === "t" ? "tv" : "movie", key.slice(1)); }
async function openDetails(kind, id) {
  CURK = kind;
  CUR = String(id);
  const b = $("mbody");
  b.innerHTML = '<div class="bd"></div><div class="in"><div class="sk" style="height:220px;border-radius:24px"></div></div>';
  modal.classList.add("open");
  try {
    const r = await fetch(`/api/${kind === "tv" ? "tv" : "movie"}/${id}?` + new URLSearchParams({ region: S.region, loc: LOC }));
    const d = await r.json();
    if (!r.ok) throw new Error();
    if (kind !== "tv") learn(d.genres);
    const item = { ...d, kind };
    remember([item]);
    const key = ky(kind, d.id), saved = inList(item);
    const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(d.title + " official trailer")}`;
    const imdb = d.imdb ? `https://www.imdb.com/title/${d.imdb}/` : `https://www.imdb.com/find/?q=${encodeURIComponent(d.title)}`;
    const meta = kind === "tv"
      ? [d.seasons ? `${d.seasons} season${d.seasons > 1 ? "s" : ""}` : "", d.episodes ? `${d.episodes} episodes` : "", d.status].filter(Boolean).join(" · ")
      : (d.runtime ? `${d.runtime} min` : "");
    const trailer = d.trailer
      ? `<div class="vid"><button class="vthumb" data-yt="${d.trailer}" style="background-image:url(https://i.ytimg.com/vi/${d.trailer}/hqdefault.jpg)" aria-label="Play trailer"><span class="vplay"><svg class="i f"><use href="#i-play"/></svg></span><span class="vlab">Watch trailer</span></button></div><a class="ylink" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${d.trailer}">Open on YouTube ↗</a>`
      : `<p class="muted">No trailer was found for this title. <a href="${yt}" target="_blank" rel="noopener">Search on YouTube</a></p>`;
    const cast = d.cast.length ? `<h4>Cast</h4><div class="cast">${d.cast.map(c => `<div class="cc">${c.photo ? `<img src="${IMG}w185${c.photo}" alt="">` : `<span></span>`}<b>${esc(c.name)}</b><small>${esc(c.role)}</small></div>`).join("")}</div>` : "";
    b.innerHTML = `<div class="bd" style="${d.backdrop ? `background-image:url(${IMG}w1280${d.backdrop})` : ""}"></div>
      <div class="in">
        <div class="mhead">${d.poster ? `<img class="mp" src="${IMG}w342${d.poster}" alt="">` : ""}<div>
          <span class="kicker">${kind === "tv" ? "Series" : "Movie"}</span>
          <h2>${esc(d.title)}</h2>
          <div class="sub">★ ${d.rating.toFixed(1)} · ${esc(d.year || "—")}${meta ? ` · ${esc(meta)}` : ""}</div>
          <div class="tags">${d.genres.map(g => `<span>${esc(g)}</span>`).join("")}</div>
          <div class="acts">
            <button class="btnp" data-soundtrack="${esc(d.title)}"><svg class="i"><use href="#i-music"/></svg>Songs</button>
            <button class="btng fav-b${saved ? " on" : ""}" data-fav="${key}"><svg class="i"><use href="#i-heart"/></svg><span>${saved ? "Saved" : "Save"}</span></button>
            <a class="btng" target="_blank" rel="noopener noreferrer" href="${imdb}"><svg class="i"><use href="#i-star"/></svg>IMDb</a>
          </div>
        </div></div>
        <p class="lead">${esc(d.overview || "No description yet.")}</p>
        ${trailer}
        ${cast}
        <div class="wh"><div class="wh-t"><h4>Where to watch</h4><span class="wh-s">Streaming options by country</span></div>${cpkHtml()}</div>
        <div id="provs">${S.region ? prov(d.providers) : '<div class="wz"><svg class="i"><use href="#i-globe"/></svg><p>Pick a country to see where you can stream this title.</p></div>'}</div>
        ${rail(kind === "tv" ? "More series like this" : "More like this", d.similar, "", false)}
      </div>`;
  } catch {
    b.innerHTML = `<div class="in">${errCard("We couldn't open this title right now.", `${kind === "tv" ? "show" : "movie"}:${id}`)}</div>`;
  }
}
function openGate() {
  $("mbody").innerHTML = `<div class="gate"><div class="gic"><svg class="i"><use href="#i-shield"/></svg></div><span class="kicker">Adults only</span><h2>18+ section</h2><p class="lead">This section includes adult content. Continue only if you are 18 or older and this content is legal where you live.</p><div class="acts"><button class="btnp" data-gate="yes">I am 18 or older</button><button class="btng" data-gate="no">Not now</button></div></div>`;
  modal.classList.add("open");
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
  if (!$("cmsgs").children.length) addMsg("a", "Hi! Ask me for a mood, a language or a genre. Indian titles come first. This chat clears when you close the panel.");
  setTimeout(() => $("cin").focus(), 350);
}
function closeChat() { $("chat").classList.remove("open"); chatHist.length = 0; $("cmsgs").innerHTML = ""; $("cleft").textContent = ""; }
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
    const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json", "x-client-id": UID }, body: JSON.stringify({ messages: chatHist.slice(-10) }) });
    const d = await r.json();
    if (!r.ok) { wait.remove(); return addMsg("a", d.error || "Please try again later."); }
    wait.remove();
    addMsg("a", d.reply);
    if (d.left != null) $("cleft").textContent = ` · ${d.left} left today`;
    chatHist.push({ role: "assistant", content: d.reply });
    if (d.picks && d.picks.length) {
      remember(d.picks);
      $("cmsgs").insertAdjacentHTML("beforeend", `<div class="cpicks">${d.picks.map(m => `<button class="cp" data-open="${ky("movie", m.id)}">${m.poster ? `<img src="${IMG}w185${m.poster}" alt="">` : ""}<span>${esc(m.title)}</span></button>`).join("")}</div>`);
      $("cmsgs").scrollTop = 1e9;
    }
  } catch {
    wait.remove();
    addMsg("a", "Sorry, I could not answer right now. Please try again in a moment.");
  }
}

// Song player with progress and platform links
const fmt = s => isFinite(s) ? `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}` : "0:00";
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
function syncPlay() { Q("#npBtn use").setAttribute("href", audio.paused ? "#i-play" : "#i-pause"); markPlaying(); }
audio.ontimeupdate = () => { $("prog").style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + "%"; $("tcur").textContent = fmt(audio.currentTime); };
audio.onloadedmetadata = () => { $("tdur").textContent = fmt(audio.duration); };
audio.onplay = audio.onpause = audio.onended = syncPlay;
$("pbar").onclick = e => { if (!audio.duration) return; const r = e.currentTarget.getBoundingClientRect(); audio.currentTime = (e.clientX - r.left) / r.width * audio.duration; };
$("npBtn").onclick = () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); };

// Global events
document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest("#cpkBtn")) { togglePop(); return; }
  const cc = t.closest("[data-cc]");
  if (cc && t.closest("#cpkPop")) { pickCountry(cc.dataset.cc); return; }
  if (!t.closest("#cpk") && cpkOpen()) closePop();
  const fv = t.closest("[data-fav]");
  if (fv) { e.preventDefault(); toggleList(M[fv.dataset.fav]); return; }
  const rt = t.closest("[data-retry]");
  if (rt) { const a = rt.dataset.retry; if (a === "home") go("home"); else if (a.startsWith("movie:") || a.startsWith("show:")) openDetails(a.startsWith("show:") ? "tv" : "movie", a.split(":")[1]); else go(S.view); return; }
  const op = t.closest("[data-open]");
  if (op) { openKey(op.dataset.open); return; }
  const sg = t.closest("[data-sg]");
  if (sg) { sx.hidden = true; $("q").value = ""; openKey(sg.dataset.sg); return; }
  const rc = t.closest("[data-recent]");
  if (rc) { $("q").value = rc.dataset.recent; runSearch(rc.dataset.recent); return; }
  const cq = t.closest("[data-cq]");
  if (cq) { sendChat(cq.dataset.cq); return; }
  const sl = t.closest("[data-slide]");
  if (sl) { heroShow(+sl.dataset.slide); return; }
  const gt = t.closest("[data-gate]");
  if (gt) { if (gt.dataset.gate === "yes") { SET("fh_18", true); renderPills(); closeModal(); go("adult"); } else closeModal(); return; }
  if (t.closest("[data-adult-off]")) { SET("fh_18", false); renderPills(); go("home"); return; }
  if (!t.closest(".sx")) sx.hidden = true;
  const v = t.closest("[data-v]");
  if (v) {
    e.preventDefault();
    const x = v.dataset.v;
    if (x === "surprise") surprise();
    else if (x === "chat") openChat();
    else if (x === "adult") { LS("fh_18", false) ? go("adult") : openGate(); }
    else go(x);
    return;
  }
  const f = t.closest("[data-info]");
  if (f) { openInfo(f.dataset.info); return; }
  const c = t.closest(".card");
  if (c) { c.dataset.kind === "song" ? playSong(T[c.dataset.id]) : openKey(c.dataset.key); }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { if (cpkOpen()) { closePop(); return; } closeModal(); sx.hidden = true; closeChat(); }
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
  const yb = e.target.closest("[data-yt]");
  if (yb) { yb.closest(".vid").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${yb.dataset.yt}?autoplay=1" title="Trailer" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; return; }
  const b = e.target.closest("[data-soundtrack]");
  if (!b) return;
  const title = b.dataset.soundtrack;
  closeModal();
  go("songs", { q: title + " soundtrack", chip: -1 });
};
$("mbody").onchange = e => { if (e.target.id === "rsel") { S.region = e.target.value; openDetails(CURK, CUR); } };
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
document.addEventListener("pointerdown", e => {
  const el = e.target.closest(".btnp,.btng,.chip,.pill,.ib,.dock button,.sg,.card,.cp");
  if (!el) return;
  const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement("span");
  s.className = "rp";
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  el.append(s);
  setTimeout(() => s.remove(), 700);
}, { passive: true });

// Country picker: searchable, with flags and popular countries first
const PIN = ["BD", "IN", "US", "GB", "CA", "AU", "AE", "SG", "MY", "PK"];
const flagOf = c => c ? String.fromCodePoint(...[...c].map(ch => 127397 + ch.charCodeAt(0))) : "🌍";
const nameOf = c => (REG.find(x => x[0] === c) || [])[1] || "Select country";
function cpkHtml() {
  return `<div class="cpk" id="cpk"><button class="cpk-btn" id="cpkBtn" type="button" aria-haspopup="listbox" aria-expanded="false"><span class="cpk-flag">${flagOf(S.region)}</span><span class="cpk-name">${esc(S.region ? nameOf(S.region) : "Select country")}</span><svg class="i"><use href="#i-chev"/></svg></button><div class="cpk-pop" id="cpkPop" hidden><input class="cpk-q" id="cpkQ" type="search" placeholder="Search country" autocomplete="off" aria-label="Search country"><div class="cpk-list" id="cpkList" role="listbox"></div></div></div>`;
}
function cpkItems(q) {
  const s = q.trim().toLowerCase();
  const item = ([c, n]) => `<button class="cpk-item${c === S.region ? " on" : ""}" role="option" aria-selected="${c === S.region}" data-cc="${c}"><span class="cpk-flag">${flagOf(c)}</span><span>${esc(n)}</span>${c === S.region ? '<svg class="i"><use href="#i-check"/></svg>' : ""}</button>`;
  if (s) return REG.filter(([c, n]) => n.toLowerCase().includes(s) || c.toLowerCase() === s).map(item).join("") || '<p class="muted cpk-none">No country matches that search.</p>';
  const pinned = PIN.map(c => REG.find(x => x[0] === c)).filter(Boolean);
  const rest = REG.filter(([c]) => !PIN.includes(c));
  return `<button class="cpk-item" role="option" data-cc=""><span class="cpk-flag">🌍</span><span>No country</span></button><div class="cpk-sep">Popular</div>${pinned.map(item).join("")}<div class="cpk-sep">All countries</div>${rest.map(item).join("")}`;
}
const renderCpkList = q => { const l = $("cpkList"); if (l) l.innerHTML = cpkItems(q); };
const cpkOpen = () => { const p = $("cpkPop"); return !!p && !p.hidden; };
function closePop() {
  const p = $("cpkPop"); if (p) p.hidden = true;
  const b = $("cpkBtn"); if (b) b.setAttribute("aria-expanded", "false");
  const c = $("cpk"); if (c) c.classList.remove("open");
}
function togglePop() {
  const p = $("cpkPop"); if (!p) return;
  if (!p.hidden) { closePop(); return; }
  p.hidden = false;
  $("cpk").classList.add("open");
  $("cpkBtn").setAttribute("aria-expanded", "true");
  $("cpkQ").value = "";
  renderCpkList("");
  setTimeout(() => $("cpkQ").focus(), 60);
}
async function refreshProviders() {
  const box = $("provs");
  if (!box) return;
  if (!S.region) { box.innerHTML = '<div class="wz"><svg class="i"><use href="#i-globe"/></svg><p>Pick a country to see where you can stream this title.</p></div>'; return; }
  box.innerHTML = '<div class="sk" style="height:96px;border-radius:18px"></div>';
  try {
    const r = await fetch(`/api/${CURK === "tv" ? "tv" : "movie"}/${CUR}?` + new URLSearchParams({ region: S.region, loc: LOC }));
    const d = await r.json();
    if (!r.ok) throw new Error();
    box.innerHTML = prov(d.providers);
  } catch { box.innerHTML = '<p class="muted">Streaming information could not load right now. Please try again.</p>'; }
}
function pickCountry(c) {
  S.region = c;
  closePop();
  $("cpk").outerHTML = cpkHtml();
  refreshProviders();
}
document.addEventListener("input", e => { if (e.target.id === "cpkQ") renderCpkList(e.target.value); });

// Start
setTheme(localStorage.getItem("mf_theme") || "auto");
renderPills();
go("home");
