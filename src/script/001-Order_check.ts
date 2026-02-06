/**
 * 检查 Polymarket 真实订单
 */
import { PolymarketSDK } from '@catalyst-team/poly-sdk';
//import { TradingService, RateLimiter, createUnifiedCache } from '../../src/index.js';
import 'dotenv/config';

async function main() {
  const privateKey = process.env.POLY_PRIVKEY || process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ 没有配置私钥');
    process.exit(1);
  }

  const signatureTypeEnv = process.env.SIGNATURE_TYPE;
  const signatureType = signatureTypeEnv ? (parseInt(signatureTypeEnv, 10) as 0 | 1) : 0;

  // Initialize SDK
  console.log('Initializing SDK... with signature type ' + signatureType);
  const sdk = new PolymarketSDK({
    privateKey: privateKey,
    signatureType: signatureType,
  });

  const client = sdk.tradingService;

  console.log('⏳ 初始化...');
  await client.initialize();
  console.log(`✅ 钱包: ${client.getAddress()}`);

  // 检查 USDC 余额
  console.log('\n📊 余额:');
  const balance = await client.getBalanceAllowance('COLLATERAL');
  console.log(`   USDC: $${(Number(balance.balance) / 1e6).toFixed(2)}`);
  console.log(`   Allowance: $${(Number(balance.allowance) / 1e6).toFixed(2)}`);

  // 检查未完成订单
  console.log('\n📋 Open Orders:');
  const orders = await client.getOpenOrders();
  if (orders.length === 0) {
    console.log('   (无)');
  } else {
    for (const order of orders) {
      console.log(`   ${order.id}: ${order.side} ${order.remainingSize}@${order.price} (${order.status})`);
    }
  }

  // 检查最近交易
  console.log('\n💰 Recent Trades:');
  const trades = await client.getTrades();
  if (trades.length === 0) {
    console.log('   (无)');
  } else {
    for (const trade of trades.slice(0, 10)) {
      console.log(` ConditionId: ${trade.marketConditionId}, TradeId: ${trade.id}: ${trade.side} ${trade.size}@${trade.price} (fee: ${trade.fee})`);
    }
  }
}

main().catch(console.error);
