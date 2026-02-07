// src/config/tools.ts
import { Tool, Type } from '@google/genai';

export const agentTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "get_market_price",
        description: "Fetch the current price, volume, and spread of a specific Polymarket ticker or condition ID.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            ticker: {
              type: Type.STRING,
              description: "The market slug (e.g., 'trump-presidency') or Condition ID."
            }
          },
          required: ["ticker"]
        }
      },
      {
        name: "get_my_positions",
        description: "Fetch the user's current open positions, profit/loss, and balance.",
        parameters: {
          type: Type.OBJECT,
          properties: {} // No arguments needed
        }
      }
    ]
  }
];