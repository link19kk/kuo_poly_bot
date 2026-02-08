import { sdk } from '../lib/polymarket.js';

type KLineInterval = '1h' | '4h' | '1d';

interface KLine {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tradeCount: number;
}

export class PolymarketService {
  private aggregateToKLines(trades: any[], interval: KLineInterval): KLine[] {
    const intervalMs = this.getIntervalMs(interval);
    const klineMap = new Map<number, KLine>();

    for (const trade of trades) {
      const tradeTime = new Date(trade.timestamp).getTime();
      const candleTime = Math.floor(tradeTime / intervalMs) * intervalMs;

      if (!klineMap.has(candleTime)) {
        klineMap.set(candleTime, {
          timestamp: candleTime,
          open: trade.price,
          high: trade.price,
          low: trade.price,
          close: trade.price,
          volume: trade.size || 0,
          tradeCount: 0
        });
      }

      const candle = klineMap.get(candleTime)!;
      candle.high = Math.max(candle.high, trade.price);
      candle.low = Math.min(candle.low, trade.price);
      candle.close = trade.price;
      candle.volume += trade.size || 0;
      candle.tradeCount++;
    }

    return Array.from(klineMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  private getIntervalMs(interval: KLineInterval): number {
    switch (interval) {
      case '1h': return 60 * 60 * 1000;
      case '4h': return 4 * 60 * 60 * 1000;
      case '1d': return 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  async getMarketKline(conditionId: string, interval: KLineInterval = '1h') {
    // 1. Fetch market info
    const market = await sdk.getMarket(conditionId);
    console.log('Selected: ' + market.question);

    // 2. Fetch trade history
    const trades = await sdk.dataApi.getTradesByMarket(market.conditionId, 500);
    const marketDescription = `Market: ${market.question} (Description: ${market.description})`;

    console.log('Found ' + trades.length + ' trades');

    if (trades.length === 0) {
      return { error: 'No trades found for this market' };
    }

    // 4. Separate trades by token (YES vs NO)
    const yesTrades = trades.filter((t) => t.outcomeIndex === 0 || t.outcome === 'Yes');
    const noTrades = trades.filter((t) => t.outcomeIndex === 1 || t.outcome === 'No');

    // 5. Aggregate into candles
    const yesCandles = this.aggregateToKLines(yesTrades, interval);
    const noCandles = this.aggregateToKLines(noTrades, interval);

    // 6. Calculate spread over time
    const yesMap = new Map(yesCandles.map((c) => [c.timestamp, c]));
    const noMap = new Map(noCandles.map((c) => [c.timestamp, c]));

    const allTimestamps = [...new Set([...yesMap.keys(), ...noMap.keys()])].sort((a, b) => a - b);
    let lastYes = 0.5;
    let lastNo = 0.5;

    const spreadAnalysis = allTimestamps.map((ts) => {
      const yesCandle = yesMap.get(ts);
      const noCandle = noMap.get(ts);

      if (yesCandle) lastYes = yesCandle.close;
      if (noCandle) lastNo = noCandle.close;

      const spread = lastYes + lastNo;
      // const arbOpportunity = spread < 1 ? 'LONG ARB' : spread > 1 ? 'SHORT ARB' : 'NEUTRAL';

      return { timestamp: ts, yesPrice: lastYes, noPrice: lastNo, spread, description: marketDescription, volume: market.volume, volume24hr: market.volume24hr, yesTrend: yesCandles.slice(-10), noTrend: noCandles.slice(-10) };
    });

    return {
      question: market.question,
      conditionId: market.conditionId,
      interval,
      yesCandles: yesCandles.slice(-5),
      noCandles: noCandles.slice(-5),
      spreadAnalysis: spreadAnalysis.slice(-5)
    };
  }
}

export const polyService = new PolymarketService();