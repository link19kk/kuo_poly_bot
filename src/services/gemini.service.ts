import { aiClient } from '../lib/Gemini.js';
//import { MarketPriceData } from '../types/market'; // Assume you move the interface to a types file

export const geminiService = {
  /**
   * Generates a trading sentiment summary based on market data.
   */
  async generateSentimentSummary(ticker: string, priceData: any): Promise<string> {
    // 1. Build the prompt
    const prompt = `
      You are a Polymarket sentiment assistant.
      Context: Market ticker "${ticker}". 
      Data: ${JSON.stringify(priceData)}.
      
      Task: Provide a concise trading sentiment summary in 3-5 bullet points.
      Constraints: 
      - Use professional trading terminology.
      - Do not give financial advice. 
      - End with a short risk note in italics.
    `.trim();

    try {
      // 2. Call the unified SDK method
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash', // High speed, low latency
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      // 3. Extract and return text
      return response.text || "⚠️ Gemini could not generate a summary.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to reach Gemini analysis engine.");
    }
  }
};