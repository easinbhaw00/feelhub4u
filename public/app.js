const IMG = "https://image.tmdb.org/t/p/";
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const MOVIE_CHIPS = [
  ["Trending", "trending", ""], ["Top Rated", "top", ""], ["Upcoming", "upcoming", ""], ["Now Playing", "now", ""],
  ["Action", "", "28"], ["Comedy", "", "35"], ["Drama", "", "18"], ["Romance", "", "10749"], ["Thriller", "", "53"], ["Horror", "", "27"], ["Sci-Fi", "", "878"], ["Animation", "", "16"],
  ["Happy", "", "35|16|10751"], ["Sad", "", "18|10749"], ["Excited", "", "28|12|53"], ["Scared", "", "27|53"], ["Relaxed", "", "16|10751|14"], ["Thoughtful", "", "99|36|9648"]
];
const SONG_CHIPS = [
  ["Top Hits", "top hits"], ["Bangla", "bangla songs"], ["Bollywood", "bollywood hits"], ["English Pop", "english pop hits"],
  ["Romantic", "romantic love songs"], ["Sad", "sad songs"], ["Party", "party dance hits"], ["Chill", "lofi chill"]
];
const LANGS = [["", "All languages"], ["en", "English"], ["bn", "Bangla"], ["hi", "Hindi"], ["ko", "Korean"], ["ja", "Japanese"], ["es", "Spanish"], ["fr", "French"], ["ta", "Tamil"], ["te", "Telugu"], ["zh", "Chinese"], ["th", "Thai"]];
const REGIONS = [["BD", "Bangladesh"], ["IN", "India"], ["US", "United States"], ["GB", "United Kingdom"], ["CA", "Canada"], ["AU", "Australia"], ["AE", "UAE"], ["SG", "Singapore"], ["MY", "Malaysia"]];
const S = { mode: "movies", type: "trending", genres: "", q: "", lang: "", region: "BD", page: 1, pages: 1, chip: 0 };
const M = {}, T = {};
const root = document.documentElement, modal = $("modal");
const audio = new Audio();
let seq = 0, busy = false, now = "";

// Theme
const isDark = () => root.dataset.theme === "dark" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
function syncThemeIcon() { document.querySelector("#theme use").setAttribute("href", isDark() ? "#i-sun" : "#i-moon"); }
function setTheme(t) {
  if (t === "auto") root.removeAttribute("data-theme"); else root.dataset.theme = t;
  localStorage.setItem("mf_theme", t);
  syncThemeIcon();
}
$("theme").onclick = () => setTheme(isDark() ? "light" : "dark");

// Cursor spotlight effect
let raf = 0;
addEventListener("pointermove", e => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    root.style.setProperty("--mx", e.clientX + "px");
    root.style.setProperty("--my", e.clientY + "px");
  });
}, { passive: true });

// Controls
$("lang").innerHTML = LANGS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
$("region").innerHTML = REGIONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
$("region").value = S.region;
$("lang").onchange = () => { S.lang = $("lang").value; load(false); };
$("region").onchange = () => { S.region = $("region").value; };
let timer;
$("q").oninput = e => {
  clearTimeout(timer);
  timer = setTimeout(() => { S.q = e.target.value.trim(); mark(S.q ? -1 : S.chip); load(false); }, 350);
};

// Categories
const chipList = () => S.mode === "movies" ? MOVIE_CHIPS : SONG_CHIPS;
function mark(i) { document.querySelectorAll(".chip").forEach((el, k) => el.classList.toggle("on", k === i)); }
function renderChips() {
  $("chips").innerHTML = chipList().map((c, i) =>
    (S.mode === "movies" && (i === 4 || i === 12) ? '<span class="sep"></span>' : "") +
    `<button class="chip" data-i="${i}">${c[0]}</button>`).join("");
  mark(S.chip);
}
$("chips").onclick = e => {
  const b = e.target.closest(".chip");
  if (!b) return;
  S.chip = +b.dataset.i;
  const c = chipList()[S.chip];
  if (S.mode === "movies") { S.type = c[1]; S.genres = c[2]; } else SONG_TERM = c[1];
  S.q = ""; $("q").value = "";
  mark(S.chip);
  load(false);
};
let SONG_TERM = "top hits";

// Modes: movies / songs
function setMode(m, q = "") {
  S.mode = m;
  document.body.dataset.mode = m;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.m === m));
  $("h1").innerHTML = m === "movies" ? 'Find your next <span>movie night</span>' : 'Feel the <span>music</span>';
  $("sub").textContent = m === "movies"
    ? "Trending and mood-based picks, with trailers and where to stream."
    : "Listen to 30-second previews from your favourite artists and soundtracks.";
  $("q").placeholder = m === "movies" ? "Search movies by title…" : "Search songs or artists…";
  Object.assign(S, { q, chip: 0, type: "trending", genres: "", page: 1 });
  SONG_TERM = SONG_CHIPS[0][1];
  $("q").value = q;
  renderChips();
  if (q) mark(-1);
  load(false);
}
document.querySelectorAll(".tab").forEach(t => t.onclick = () => { if (S.mode !== t.dataset.m) setMode(t.dataset.m); });
$("home").onclick = e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); setMode("movies"); };

// Loading
async function load(more) {
  if (more && busy) return;
  const my = ++seq;
  busy = true;
  const grid = $("grid");
  if (!more) grid.innerHTML = Array.from({ length: 10 }, () => '<div class="skel"><div class="sk"></div></div>').join("");
  try {
    if (S.mode === "movies") await loadMovies(more, my);
    else await loadSongs(my);
  } catch {
    if (!more && my === seq) grid.innerHTML = '<p class="empty">Could not load right now. Please try again.</p>';
  } finally {
    if (my === seq) busy = false;
  }
}

const card = (m, i) => `<article class="card" tabindex="0" data-kind="movie" data-id="${m.id}" style="--i:${i % 12}">
  <div class="poster">${m.poster ? `<img loading="lazy" src="${IMG}w500${m.poster}" alt="">` : `<div class="noimg">${esc(m.title)}</div>`}
    <span class="rate"><svg class="i f"><use href="#i-star"/></svg>${m.rating.toFixed(1)}</span>
    <span class="over">View details</span></div>
  <div class="meta"><h3>${esc(m.title)}</h3><p>${esc(m.year || "—")} · ${esc(m.lang.toUpperCase())}</p></div></article>`;

async function loadMovies(more, my) {
  const qs = new URLSearchParams({ type: S.type, genres: S.genres, q: S.q, lang: S.lang, page: more ? S.page + 1 : 1 });
  const r = await fetch("/api/movies?" + qs);
  const d = await r.json();
  if (!r.ok) throw new Error(d.error);
  if (my !== seq) return;
  S.page = d.page;
  S.pages = d.totalPages;
  d.results.forEach(m => M[m.id] = m);
  const html = d.results.map(card).join("");
  if (more) $("grid").insertAdjacentHTML("beforeend", html);
  else $("grid").innerHTML = html || '<p class="empty">No movies found. Try another filter.</p>';
  $("more").hidden = S.page >= S.pages;
}

const songCard = (t, i) => `<article class="card song" tabindex="0" data-kind="song" data-id="${t.id}" style="--i:${i % 12}">
  <div class="poster">${t.art ? `<img loading="lazy" src="${esc(t.art)}" alt="">` : `<div class="noimg"><svg class="i"><use href="#i-music"/></svg></div>`}
    <span class="play"><svg class="i f"><use href="#i-play"/></svg></span></div>
  <div class="meta"><h3>${esc(t.title)}</h3><p>${esc(t.artist)}</p></div></article>`;

async function loadSongs(my) {
  const term = S.q || SONG_TERM;
  const r = await fetch(`https://itunes.apple.com/search?media=music&entity=song&limit=36&term=${encodeURIComponent(term)}`);
  const d = await r.json();
  if (my !== seq) return;
  const list = (d.results || []).filter(x => x.trackName).map(x => ({
    id: x.trackId, title: x.trackName, artist: x.artistName || "",
    art: (x.artworkUrl100 || "").replace("100x100bb", "300x300bb"),
    preview: x.previewUrl || "", url: x.trackViewUrl || ""
  }));
  list.forEach(t => T[t.id] = t);
  $("grid").innerHTML = list.length ? list.map(songCard).join("") : '<p class="empty">No songs found. Try another search.</p>';
  $("more").hidden = true;
  markPlaying();
}
$("more").onclick = () => load(true);

// Click handling
$("grid").onclick = e => {
  const c = e.target.closest(".card");
  if (!c) return;
  if (c.dataset.kind === "song") playSong(T[c.dataset.id]); else openMovie(c.dataset.id);
};
$("grid").onkeydown = e => { if (e.key === "Enter" && e.target.classList.contains("card")) e.target.click(); };

// Audio player
function playSong(t) {
  if (!t.preview) { window.open(t.url, "_blank", "noopener"); return; }
  if (now === String(t.id)) { audio.paused ? audio.play().catch(() => {}) : audio.pause(); return; }
  now = String(t.id);
  audio.src = t.preview;
  audio.play().catch(() => {});
  $("npArt").hidden = !t.art;
  if (t.art) $("npArt").src = t.art;
  $("npT").textContent = t.title;
  $("npA").textContent = t.artist;
  $("np").hidden = false;
}
function markPlaying() { document.querySelectorAll(".card.song").forEach(c => c.classList.toggle("playing", c.dataset.id === now && !audio.paused)); }
function syncPlay() {
  $("npBtn").querySelector("use").setAttribute("href", audio.paused ? "#i-play" : "#i-pause");
  markPlaying();
}
audio.onplay = syncPlay;
audio.onpause = syncPlay;
audio.onended = syncPlay;
$("npBtn").onclick = () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); };

// Movie details modal
function prov(p) {
  if (!p) return '<p class="muted">Streaming data is not available for this region yet.</p>';
  const rows = [["flatrate", "Stream"], ["rent", "Rent"], ["buy", "Buy"]]
    .filter(([k]) => p[k] && p[k].length)
    .map(([k, l]) => `<div class="prow"><b>${l}</b><div>${p[k].map(x =>
      `<span class="pchip">${x.logo ? `<img src="${IMG}w45${x.logo}" alt="">` : ""}${esc(x.name)}</span>`).join("")}</div></div>`)
    .join("");
  return rows || '<p class="muted">Not streaming right now in this region.</p>';
}
const closeModal = () => { modal.classList.remove("open"); $("mbody").innerHTML = ""; };
$("close").onclick = closeModal;
modal.onclick = e => { if (e.target === modal) closeModal(); };
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

async function openMovie(id) {
  const b = $("mbody");
  b.innerHTML = '<div class="bd"></div><div class="in"><div class="sk" style="height:160px;border-radius:14px"></div></div>';
  modal.classList.add("open");
  try {
    const r = await fetch(`/api/movie/${id}?region=${S.region}`);
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    b.innerHTML = `
      <div class="bd" style="${d.backdrop ? `background-image:url(${IMG}w1280${d.backdrop})` : ""}"></div>
      <div class="in">
        <h2>${esc(d.title)}</h2>
        <div class="sub">★ ${d.rating.toFixed(1)} · ${esc(d.year || "—")}${d.runtime ? ` · ${d.runtime} min` : ""} · ${esc(d.genres.join(", "))}</div>
        <p class="muted">${esc(d.overview)}</p>
        ${d.trailer ? `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${d.trailer}" title="Trailer" loading="lazy" allowfullscreen></iframe></div>` : ""}
        <div class="acts">
          <button class="btn" data-soundtrack="${esc(d.title)}"><svg class="i"><use href="#i-music"/></svg>Songs from this movie</button>
          ${d.link ? `<a class="btn gh" target="_blank" rel="noopener noreferrer" href="${esc(d.link)}"><svg class="i"><use href="#i-tv"/></svg>All options</a>` : ""}
        </div>
        <h4>Where to watch · ${esc(S.region)}</h4>
        ${prov(d.providers)}
      </div>`;
  } catch {
    b.innerHTML = '<div class="in"><p class="muted">Details are not available right now.</p></div>';
  }
}
$("mbody").onclick = e => {
  const btn = e.target.closest("[data-soundtrack]");
  if (!btn) return;
  const title = btn.dataset.soundtrack;
  closeModal();
  setMode("songs", `${title} soundtrack`);
};

// Start
setTheme(localStorage.getItem("mf_theme") || "auto");
setMode("movies");
