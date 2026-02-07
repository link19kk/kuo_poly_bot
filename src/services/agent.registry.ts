// src/services/agent.registry.ts
import { polyService } from './polymarket.service.js';

// Define a type for your function map
type ToolFunction = (args: any) => Promise<any>;

export const toolRegistry: Record<string, ToolFunction> = {
  // Map the string name to the actual function execution
  "get_market_price": async (args) => {
    console.log(`🤖 Agent calling market price for: ${args.ticker}`);
    return await polyService.getMarketKline(args.ticker, '1h'); // Reusing your existing service!
  }
  
//   "get_my_positions": async () => {
//     console.log(`🤖 Agent checking positions...`);
//     // Assuming you add this method to polyService
//     return await polyService.getPositions(); 
//   }
};