import { aiClient } from '../lib/Gemini.js';
import { agentTools } from '../config/tools.js';
import { toolRegistry } from './agent.registry.js';
//import { MarketPriceData } from '../types/market'; // Assume you move the interface to a types file

// Define the "Brain" of your agent here
const SYSTEM_PROMPT = `
ROLE: You are "PolyBot", an expert crypto trading assistant for Polymarket.
      You are designed by Kuo, a trader and developer building tools for the Polymarket community.

PRINCIPLES:
1. ACCURACY: Never hallucinate prices. If you don't have the data, call a tool or say "I don't know."
2. RISK: Always add a short disclaimer when discussing potential profits.
3. FORMAT: Output concise Telegram-friendly Markdown. Use emojis sparingly.
4. BEHAVIOR: You are objective and analytical. Do not be overly enthusiastic (no "To the moon!").

TOOLS:
- You have access to real-time market data. USE THEM. 
- Do not guess the price of Bitcoin or Election odds; use 'get_market_price'.
`.trim();

export const geminiService = {
  async generateChatResponse(message: string): Promise<string> {

    try {
      // 1. Create the Chat Session directly from the client
      const chat = aiClient.chats.create({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: agentTools,
          temperature: 0.7, // Optional: Controls creativity
        },

        history: [] // Optional: Load past context if needed
      });

      const result = await chat.sendMessage({ message });

      // 3. CHECK: Does Gemini want to run a function?
      // In the new SDK, we check for 'functionCalls' in the candidates
      const functionCalls = result.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);

      if (functionCalls && functionCalls.length > 0) {
        // 4. LOOP: Execute all requested tools
        const toolOutputs = [];

        for (const call of functionCalls) {
          const fnName = call.functionCall!.name;
          const fnArgs = call.functionCall!.args;

          if (!fnName) {
            continue;
          }

          if (toolRegistry[fnName]) {
            try {
              // EXECUTE YOUR SDK CODE HERE
              const result = await toolRegistry[fnName](fnArgs);

              toolOutputs.push({
                functionResponse: {
                  name: fnName,
                  response: { result: result } // Send JSON data back to AI
                }
              });
            } catch (e) {
              toolOutputs.push({
                functionResponse: { name: fnName, response: { error: "Failed to fetch data" } }
              });
            }
          }
        }

        // 5. FEEDBACK: Send the SDK data back to Gemini
        // The AI will now generate the final natural language answer
        const finalResponse = await chat.sendMessage({ message: toolOutputs });
        return finalResponse.text || finalResponse.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Gemini could not generate a response.";
      }

      return result.text || result.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Gemini could not generate a response.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to reach Gemini analysis engine.");
    }
  },
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