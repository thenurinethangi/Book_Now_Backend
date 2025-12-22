import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import axios from "axios";
import { OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_URL } from "../config/huggingFaceConfig";

export async function generateMovieSummery(req: AuthRequest, res: Response) {

    const { movieTitle } = req.body;

    if (!movieTitle) return res.status(400).json({ message: "Movie title is required", data: null });

    const messages = [
        {
            role: "system",
            content: `
Write a COMPLETE and DETAILED movie summary covering the full story from beginning to end.
Rules:
- Write ONLY the summary, no opinions or reviews
- Cover the full plot from beginning to end
- Length: 500–1000 words
- Use multiple paragraphs naturally
- Do NOT include titles, bullet points, or actor/director names
- Natural, flowing English
      `,
        },
        { role: "user", content: `Write a detailed movie summary for: ${movieTitle}` },
    ];

    try {
        const response = await axios.post(
            OPENROUTER_URL,
            { model: OPENROUTER_MODEL, messages, max_tokens: 2000, temperature: 0.7 },
            { headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" } }
        );

        const summary = response.data?.choices?.[0]?.message?.content;
        if (!summary) return res.status(500).json({ message: "AI returned no summary", data: null });

        res.status(200).json({ message: "Movie summary generated", data: summary });
        return
    }
    catch (err: any) {
        console.error("OpenRouter error:", err.response?.data || err.message);
        res.status(500).json({ message: "Failed to generate movie summary", data: null });
        return
    }
}
