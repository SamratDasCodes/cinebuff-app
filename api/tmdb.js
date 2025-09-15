export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: "TMDB API key not configured" });
  }

  try {
    const { endpoint, params = {} } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: "No endpoint provided" });
    }

    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    url.search = new URLSearchParams({ ...params, api_key: TMDB_API_KEY });

    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `TMDB request failed with ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("TMDB Proxy Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
