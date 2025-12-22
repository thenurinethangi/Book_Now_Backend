import { Response } from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv'
import { AuthRequest } from "../middlewares/authenticate";
dotenv.config();

const ai = new GoogleGenAI({});

export const generateMovieSummery = async (req: AuthRequest, res: Response) => {

    const { description } = req.body;

    if (!description) {
        res.status(400).json({ message: 'No Description Provide', data: null });
        return;
    }

    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: `Write a full blog post based on this topic: ${description}` });

        res.status(202).json({ message: 'Success!', data: { content: response.text } });
        return;
    }
    catch (e) {
        res.status(500).json({ message: 'Fail to generate blog post content, try later!', data: null });
        return;
    }
}