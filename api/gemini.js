import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not configured on the server.");
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    
    // FIX: The 'response' from the result is a Promise and needs to be awaited.
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });
  } catch (err) {
    console.error("Gemini Proxy Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
