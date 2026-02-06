import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

export interface MarketPriceData {
  ticker: string;
  marketName?: string;
  price?: number;
  yesPrice?: number;
  noPrice?: number;
  raw?: unknown;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(private apiKey: string, private model: string = 'gemini-2.0-flash') {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateSentimentSummary(ticker: string, priceData: MarketPriceData): Promise<string> {
    const prompt = [
      'You are a market sentiment assistant.',
      'Given the market price data, provide a concise trading sentiment summary in 3-5 bullet points.',
      'Do not give financial advice or guarantees. Add a short risk note at the end.',
      `Market ticker: ${ticker}.`,
      `Price data: ${JSON.stringify(priceData)}.`,
    ].join(' ');

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    return response.text ?? 'No response from Gemini.';
  }
}