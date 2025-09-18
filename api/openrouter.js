export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // It's recommended to store your API key in environment variables
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OpenRouter API key not configured on the server.' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        // Recommended headers for app identification on OpenRouter
        "HTTP-Referer": "https://showshelf.yourdomain.com", // Replace with your actual domain
        "X-Title": "ShowShelf",
      },
      body: JSON.stringify({
        "model": "mistralai/mistral-7b-instruct:free", // Using a free, high-quality model from OpenRouter
        "messages": [
          { "role": "user", "content": prompt }
        ]
      })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("OpenRouter API Error:", errorBody);
        return res.status(response.status).json({ error: "Failed to fetch from OpenRouter API" });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    return res.status(200).json({ text });

  } catch (err) {
    console.error('OpenRouter Proxy Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
