// src/lib/gemini.ts
import { GeminiService } from '../services/Gemini.service';
import 'dotenv/config';

// We initialize the service once and export it
export const aiService = new GeminiService(
  process.env.GEMINI_API_KEY as string,
  'gemini-2.0-flash' // Best speed/cost balance for 2026
);