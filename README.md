# FeelHub4u

Movies, upcoming releases, anime and songs in one place.

## Run locally
1. Copy `.env.example` to `.env` and paste your TMDB API key into `TMDB_API_KEY`.
2. Node.js 20.6 or newer is required. Run `npm start`.
3. Open http://localhost:3000

## Deploy on Render (free)
1. Push this folder to a GitHub repository. Do not upload `.env`.
2. In Render choose New, then Blueprint (or Web Service), and select the repository.
   The included `render.yaml` sets Node, Singapore region, build and start commands.
3. Add the environment variable `TMDB_API_KEY` with your key. Keep it secret.
4. Deploy. The free plan sleeps when idle, so the first load can take about a minute.

## Notes
- The TMDB key stays on the server. The browser never sees it.
- Song previews come from Apple's public search API and need no key.
- Movie data and images: TMDB. Streaming data: JustWatch. This product is not endorsed or certified by TMDB.

## Optional: free AI assistant
Create a free API key at Groq and set `GROQ_API_KEY` in Render (or `.env`). Without it the assistant still works with built-in picks. Free limits and model names can change; set `GROQ_MODEL` to change the model.
