import { Bot } from "grammy";
import { handleKline } from "./handlers/kline.handler.js";
import 'dotenv/config';

const token = process.env.TELEGRAM_TOKEN || process.env.BOT_TOKEN;
if (!token) {
	throw new Error("Missing TELEGRAM_TOKEN (or BOT_TOKEN) in environment.");
}

const bot = new Bot(token);

// Register the command
bot.command("kline", handleKline);

bot.start().then(() => console.log("Bot is running..."));