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
    const data = await polyService.getMarketKline(conditionId, '1h');

    if ('error' in data) {
      return ctx.api.editMessageText(ctx.chat!.id, waitMsg.message_id, `❌ ${data.error}`);
    }

    // Format YES candles
    const yesMessage = data.yesCandles
      .map((candle) => {
        const date = new Date(candle.timestamp).toLocaleString();
        return `[${date}] O:${candle.open.toFixed(3)} H:${candle.high.toFixed(3)} L:${candle.low.toFixed(3)} C:${candle.close.toFixed(3)} V:$${candle.volume.toFixed(0)} (${candle.tradeCount} trades)`;
      })
      .join("\n");

    // Format NO candles
    const noMessage = data.noCandles
      .map((candle) => {
        const date = new Date(candle.timestamp).toLocaleString();
        return `[${date}] O:${candle.open.toFixed(3)} H:${candle.high.toFixed(3)} L:${candle.low.toFixed(3)} C:${candle.close.toFixed(3)} V:$${candle.volume.toFixed(0)} (${candle.tradeCount} trades)`;
      })
      .join("\n");

    // Format spread analysis
    const spreadMessage = data.spreadAnalysis
      .map((analysis) => {
        const date = new Date(analysis.timestamp).toLocaleString();
        return `[${date}] YES:${analysis.yesPrice.toFixed(3)} + NO:${analysis.noPrice.toFixed(3)} = ${analysis.spread.toFixed(4)} ${analysis.arbOpportunity}`;
      })
      .join("\n");

    const message = [
      `📊 *Market:* ${data.question}`,
      `🆔 *Condition ID:* \`${data.conditionId}\``,
      `⏱️ *Interval:* ${data.interval}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `✅ *YES Token K-Lines (Last 5):*`,
      `\`\`\``,
      yesMessage,
      `\`\`\``,
      `❌ *NO Token K-Lines (Last 5):*`,
      `\`\`\``,
      noMessage,
      `\`\`\``,
      `📈 *Spread Analysis (Last 5):*`,
      `\`\`\``,
      spreadMessage,
      `\`\`\``,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `[View on Polymarket](https://polymarket.com/event/${data.conditionId})`
    ].join("\n");

    await ctx.api.editMessageText(ctx.chat!.id, waitMsg.message_id, message, {
      parse_mode: "Markdown",
      link_preview_options: { is_disabled: true }
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await ctx.api.editMessageText(ctx.chat!.id, waitMsg.message_id, `❌ Error fetching market data: ${errorMsg}`);
  }
}