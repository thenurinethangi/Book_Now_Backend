import dotenv from "dotenv";
dotenv.config();

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODEL = "openrouter/auto";
