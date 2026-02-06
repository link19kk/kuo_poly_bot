/**
 * Polymarket Service
 * Handles interactions with Polymarket SDK
 */
import { PolymarketSDK } from '@catalyst-team/poly-sdk';

export class PolymarketService {
  private sdk: PolymarketSDK | null = null;
  private initialized = false;

  constructor(private privateKey?: string, private signatureType: 0 | 1 | 2 = 0) {}

  private ensureSdk(): PolymarketSDK {
    if (!this.sdk) {
      this.sdk = this.privateKey
        ? new PolymarketSDK({
            privateKey: this.privateKey,
            signatureType: this.signatureType,
          })
        : new PolymarketSDK();
    }

    return this.sdk;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.ensureSdk();

    if (this.privateKey) {
      await this.sdk?.tradingService.initialize();
    }

    this.initialized = true;
    console.log('✅ Polymarket SDK initialized');
  }

  getAddress(): string {
    if (!this.sdk) throw new Error('SDK not initialized');
    return this.sdk.tradingService.getAddress();
  }

  async getBalance(): Promise<{ balance: string; allowance: string }> {
    if (!this.sdk) throw new Error('SDK not initialized');
    return await this.sdk.tradingService.getBalanceAllowance('COLLATERAL');
  }

  async getOpenOrders(): Promise<any[]> {
    if (!this.sdk) throw new Error('SDK not initialized');
    return await this.sdk.tradingService.getOpenOrders();
  }

  async getTrades(limit: number = 10): Promise<any[]> {
    if (!this.sdk) throw new Error('SDK not initialized');
    const trades = await this.sdk.tradingService.getTrades();
    return trades.slice(0, limit);
  }

  async getTrendingMarkets(limit: number = 5): Promise<any[]> {
    const sdk = this.ensureSdk();
    return await (sdk as any).dataApi.getTrendingMarkets(limit);
  }

  async getMarketPriceByTicker(ticker: string): Promise<{
    ticker: string;
    marketName?: string;
    price?: number;
    yesPrice?: number;
    noPrice?: number;
    raw?: unknown;
  }> {
    const sdk = this.ensureSdk();
    const dataApi = (sdk as any).dataApi;
    if (!dataApi) throw new Error('Data API not available');

    let market: any;
    if (typeof dataApi.getMarketByTicker === 'function') {
      market = await dataApi.getMarketByTicker(ticker);
    } else if (typeof dataApi.getMarkets === 'function') {
      const result = await dataApi.getMarkets({ query: ticker, limit: 1 });
      market = Array.isArray(result)
        ? result[0]
        : result?.markets?.[0] ?? result?.data?.[0] ?? result?.items?.[0];
    } else if (typeof dataApi.getMarket === 'function') {
      market = await dataApi.getMarket(ticker);
    }

    if (!market) {
      throw new Error(`Market not found for ticker: ${ticker}`);
    }

    const toNumber = (value: unknown): number | undefined => {
      const num = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN;
      return Number.isFinite(num) ? num : undefined;
    };

    const yesPrice =
      toNumber(market.yesPrice) ??
      toNumber(market.yes_price) ??
      toNumber(market?.tokens?.find((t: any) => t?.outcome === 'Yes')?.price);

    const noPrice =
      toNumber(market.noPrice) ??
      toNumber(market.no_price) ??
      toNumber(market?.tokens?.find((t: any) => t?.outcome === 'No')?.price);

    const price =
      toNumber(market.price) ??
      toNumber(market.lastPrice) ??
      toNumber(market.marketPrice) ??
      toNumber(market.lastTradePrice) ??
      yesPrice ??
      noPrice;

    return {
      ticker,
      marketName: market.title ?? market.question ?? market.name,
      price,
      yesPrice,
      noPrice,
      raw: market,
    };
  }
}
