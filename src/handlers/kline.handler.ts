import { Context } from "grammy";
import { polyService } from "../services/polymarket.service.js";

export async function handleKline(ctx: Context) {
  // Extract ConditionID from command: /kline <ID>
  const conditionId = ctx.match as string;

  if (!conditionId) {
    return ctx.reply("❌ Please provide a Market Condition ID.\nUsage: `/kline 0x634...`", { parse_mode: "Markdown" });
  }

  const waitMsg = await ctx.reply("🔍 Fetching market data...");

  try {
    const data = await polyService.getMarketKline(conditionId);

    const message = [
      `📊 *Market:* ${data.question}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 *Current Price:* $${data.current}`,
      `🔺 *24h High:* $${data.high}`,
      `🔻 *24h Low:* $${data.low}`,
      `🌡️ *Trend:* ${data.trend}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `[View on Polymarket](https://polymarket.com/event/${conditionId})`
    ].join("\n");

    await ctx.api.editMessageText(ctx.chat!.id, waitMsg.message_id, message, {
      parse_mode: "Markdown",
      disable_web_page_preview: false
    });

  } catch (error) {
    await ctx.api.editMessageText(ctx.chat!.id, waitMsg.message_id, "❌ Error fetching market data. Ensure the ID is correct.");
  }
}