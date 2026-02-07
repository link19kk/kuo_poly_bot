import { Bot } from "grammy";
import { handleKline } from "./handlers/kline.handler.js";
import { geminiService } from "./services/gemini.service.js";
import 'dotenv/config';

const token = process.env.TELEGRAM_TOKEN || process.env.BOT_TOKEN;
if (!token) {
	throw new Error("Missing TELEGRAM_TOKEN (or BOT_TOKEN) in environment.");
}

const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
	const text = ctx.message.text?.trim();
	if (!text) return;

	if (text.startsWith("/kline")) {
		const conditionId = text.replace(/^\/kline\s*/i, "").trim();
		(ctx as { match?: string }).match = conditionId;
		return handleKline(ctx);
	}

	try {
		const reply = await geminiService.generateChatResponse(text);
		return ctx.reply(reply);
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : "Unknown error";
		return ctx.reply(`❌ Gemini error: ${errorMsg}`);
	}
});

bot.start().then(() => console.log("Bot is running..."));