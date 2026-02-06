/**
 * Telegram Bot Entry Point
 * Using grammY framework
 */
import { Bot } from 'grammy';
import 'dotenv/config';
import { GeminiService, PolymarketService } from './services/index.js';

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  console.error('❌ BOT_TOKEN not found in environment variables');
  process.exit(1);
}

const bot = new Bot(botToken);

const privateKey =
  process.env.POLY_PRIVKEY || process.env.PRIVATE_KEY || process.env.POLYMARKET_PRIVATE_KEY;
const signatureTypeRaw = process.env.SIGNATURE_TYPE;
const signatureType = signatureTypeRaw ? (Number(signatureTypeRaw) as 0 | 1 | 2) : 0;
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

const polymarketService = new PolymarketService(privateKey, signatureType);
let geminiService: GeminiService | null = null;

const getGeminiService = (): GeminiService => {
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY not set');
  if (!geminiService) geminiService = new GeminiService(geminiApiKey);
  return geminiService;
};

// Basic commands
bot.command('start', (ctx) => {
  ctx.reply('Welcome to Kuo Poly Bot! 🤖\n\nAvailable commands:\n/help - Show help\n/status - Check bot status');
});

bot.command('help', (ctx) => {
  ctx.reply('Available commands:\n/start - Start the bot\n/status - Check bot status\n/ping - Ping the bot');
});

bot.command('status', (ctx) => {
  ctx.reply('✅ Bot is running!');
});

bot.command('ping', (ctx) => {
  ctx.reply('🏓 Pong!');
});

bot.command('analyze', async (ctx) => {
  const text = ctx.message?.text?.trim() ?? '';
  const [, ticker] = text.split(/\s+/);

  if (!ticker) {
    await ctx.reply('Usage: /analyze <TICKER>');
    return;
  }

  try {
    await polymarketService.initialize();
    const priceData = await polymarketService.getMarketPriceByTicker(ticker);
    const summary = await getGeminiService().generateSentimentSummary(ticker, priceData);
    await ctx.reply(summary);
  } catch (error) {
    console.error('Analyze error:', error);
    await ctx.reply('❌ Failed to analyze the market. Please try again later.');
  }
});

// Handle all other messages
bot.on('message', (ctx) => {
  console.log(`Received message: ${ctx.message.text}`);
});

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

// Start the bot
console.log('🚀 Starting bot...');
bot.start();
console.log('✅ Bot is running!');
