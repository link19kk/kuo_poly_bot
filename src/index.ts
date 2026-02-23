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

	// ... existing code above ...

	let processingMsg;
	try {
		// 1. Send the temporary "Processing" message
		processingMsg = await ctx.reply("⏳ Processing your request...");

		// Optional but highly recommended: Show the "typing..." indicator at the top of the screen
		await ctx.replyWithChatAction("typing");

		// 2. Call your AI service
		const reply = await geminiService.generateChatResponse(text);

		// 3. Edit the temporary message with the actual AI response
		return ctx.api.editMessageText(
			ctx.chat.id,
			processingMsg.message_id,
			reply,
			// Keep your global parse_mode (HTML) active for the edit
			{ parse_mode: "HTML" }
		);

	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : "Unknown error";
		const formattedError = `❌ Gemini error: ${errorMsg}`;

		// If it failed *after* we sent the processing message, edit it to show the error
		if (processingMsg) {
			return ctx.api.editMessageText(
				ctx.chat.id,
				processingMsg.message_id,
				formattedError
			);
		}

		// Fallback if it failed before sending the processing message
		return ctx.reply(formattedError);
	}
});

bot.start().then(() => console.log("Bot is running..."));