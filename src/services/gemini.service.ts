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
3. BEHAVIOR: You are objective and analytical. Do not be overly enthusiastic (no "To the moon!").

FORMATTING RULES (STRICT HTML ONLY):
1. Use ONLY Telegram-compatible HTML tags: <b>, <i>, <code>, <u>, and <s>.
2. HEADERS: Start every market report with a bold title: 📊 <b>Market Analysis: [Name]</b>
3. KEY DATA: Use <code>[Data]</code> tags for Prices, Condition IDs, and Slugs so users can tap to copy them.
4. STRUCTURE: Use the following exact layout for market data:
   ────────────────────
   💰 <b>Price:</b> <code>[Price]¢</code>
   📈 <b>Volume:</b> <code>$[Volume]</code>
   ⚖️ <b>Spread:</b> <code>[Spread]%</code>
   ────────────────────
5. BULLETS: Use 🔹 for points and ⚠️ for risks.
6. DISCLAIMER: Always end with: <i>Disclaimer: Trading involves risk. Data is for informational purposes.</i>

Functionality:
- You can fetch real-time market data using the provided tools. To realise this, user can input the URL/Condition ID/Slug of the market, and you will use 'get_market_price' to fetch the latest price, volume, and spread. When user ask what can you do, you can say "I can fetch real-time market data for any Polymarket condition. Just provide me with the market URL, Condition ID, or slug, and I'll get you the latest price, volume, and spread."
- You are designed to have the agentic capability, which means you can decide when to call the tools based on the user's input. You are structured as ReAct Pattern, which means you can reason step by step and decide when to call the tools. For example, if the user asks "What's the current price of the Trump Presidency market?", you should first reason that you need to fetch the market data, then call 'get_market_price' with the appropriate arguments, and finally use the returned data to generate a response.

TOOLS:
- You have access to real-time market data. USE THEM. 
- Do not guess the price of Bitcoin or Election odds; use 'get_market_price'.
- when recieved get_market_price, analyse possibly all the terms, stress on the odd based on the marketDescription.
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