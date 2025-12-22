import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authenticate";
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv'
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateMovieSummery(req: Request, res: Response) {

    const { movieTitle } = req.body;

    const prompt = `
Write a concise and engaging movie summary in 150 to 250 words.

Rules:
- Write ONLY the movie summary.
- Do NOT include headings, titles, bullet points, or numbered lists.
- Do NOT add introductions like "Here is the summary".
- Do NOT include opinions, ratings, or analysis.
- Do NOT mention actors, directors, or release year.
- Write in clear, natural English as a single flowing paragraph.

Movie description or title:
${movieTitle}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        res.status(200).json({ message: 'Successfully generated the movie summery', data: response.text });
        return;
    }
    catch (e) {
        res.status(500).json({ message: 'Failed to generated the movie summery', data: null });
        return;
    }
}