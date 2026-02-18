import { Bot } from "grammy";
import { handleKline } from "./handlers/kline.handler.js";
import { geminiService } from "./services/gemini.service.js";
import 'dotenv/config';

const token = process.env.TELEGRAM_TOKEN || process.env.BOT_TOKEN;
if (!token) {
	throw new Error("Missing TELEGRAM_TOKEN (or BOT_TOKEN) in environment.");
}

// Add the 'api' config object to the Bot constructor
const bot = new Bot(token, {
    client: {
        environment: "prod",
    },
});

// Use the 'api' plugin to set global parse_mode
bot.api.config.use((prev, method, payload, signal) => {
    if (!payload || !("parse_mode" in payload)) {
        // @ts-ignore
        payload.parse_mode = "HTML";
    }
    return prev(method, payload, signal);
});

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