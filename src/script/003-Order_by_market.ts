// npx tsx .\examples\003-Order_by_market.ts

import { PolymarketSDK } from '@catalyst-team/poly-sdk';
import 'dotenv/config';

// Read private key from environment or .env file
const PRIVATE_KEY = process.env.POLY_PRIVKEY || process.env.PRIVATE_KEY || '';

const MarketConditionId = '0x634bd1314c3044a80bf9eccf703c15eca586132e9db0d3fb2c8eb0136cfab88d'; 
const MarketSlug = ''; // Optional: use slug instead of condition ID

const TEST_AMOUNT = 5; // 5 USDC 测试 (Polymarket 最小订单量是 5 份)
const gtcPrice = 0.32; // Limit order price
const gtcSide = 'SELL'; // 'BUY' or 'SELL'

const YesTokenOutcome = 'China'; //By default, we will trade the 'Yes' outcome token

async function main() {
  if (!PRIVATE_KEY) {
    console.error('Error: Set POLY_PRIVKEY or PRIVATE_KEY environment variable');
    process.exit(1);
  }

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                      ORDER PLACEMENT                           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Order Amount: $${TEST_AMOUNT} USDC`);
  console.log('');

  // Find an active market
  console.log('Finding an active market...');
  const sdk = new PolymarketSDK();
  const market = await sdk.getMarket(MarketConditionId || MarketSlug);
  
  console.log(`Selected: ${market.question}`);
  console.log(`Condition ID: ${market.conditionId}`);
  console.log(`Slug: ${market.slug}`);
  console.log('');

  // Get token IDs
  const unifiedMarket = await sdk.getMarket(market.conditionId);
  const yesToken = unifiedMarket.tokens.find(t => t.outcome === YesTokenOutcome);
  
  if (!yesToken) {
    console.error('Could not find YES token');
    process.exit(1);
  }

  console.log(`YES Token: ${yesToken.tokenId.slice(0, 20)}...`);
  console.log('');

  const tradingService = sdk.tradingService;

  await tradingService.initialize();
  console.log(`Wallet: ${tradingService.getAddress()}`);

  // 获取当前余额
  const { balance, allowance } = await tradingService.getBalanceAllowance('COLLATERAL');
  console.log(`USDC Balance: ${(parseFloat(balance) / 1e6).toFixed(2)} USDC`);
  console.log(`Allowance: ${allowance === 'unlimited' || parseFloat(allowance) / 1e6 > 1e12 ? 'Unlimited' : (parseFloat(allowance) / 1e6).toFixed(2)}`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1: GTC Limit Order (这是 Earning Engine 使用的方式)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('TEST 1: GTC Limit Order (Earning Engine 方式)');
  console.log('═══════════════════════════════════════════════════════════════');

  // 尝试以市场价附近的价格买入 (limit order)
  const gtcSize = Math.max(5, TEST_AMOUNT / gtcPrice); // 最小 5 份

  console.log(`Placing GTC ${gtcSide} order: ${gtcSize.toFixed(2)} shares @ $${gtcPrice.toFixed(3)}`);
  console.log(`Expected cost: $${(gtcSize * gtcPrice).toFixed(2)}`);
  try {
    const gtcResult = await tradingService.createLimitOrder({
      tokenId: yesToken.tokenId,
      side: gtcSide,
      price: gtcPrice,
      size: gtcSize,
      orderType: 'GTC',
    });

    if (gtcResult.success) {
      console.log(`✅ GTC Order SUCCESS!`);
      console.log(`   Order ID: ${gtcResult.orderId}`);

      // 立即取消订单
    //   console.log('   Cancelling order...');
    //   const cancelResult = await tradingService.cancelOrder(gtcResult.orderId!);
    //   console.log(`   Cancel: ${cancelResult.success ? '✓' : '✗'}`);
    } else {
      console.log(`❌ GTC Order FAILED: ${gtcResult.errorMsg}`);
    }
  } catch (error: any) {
    console.log(`❌ GTC Order ERROR: ${error.message}`);
  }

  console.log('');

//   // ═══════════════════════════════════════════════════════════════════════════
//   // TEST 2: FOK Market Order (这是套利脚本使用的方式)
//   // ═══════════════════════════════════════════════════════════════════════════
//   console.log('═══════════════════════════════════════════════════════════════');
//   console.log(' FOK Market Order (套利脚本方式)');
//   console.log('═══════════════════════════════════════════════════════════════');

//   console.log(`Placing FOK BUY order: $${TEST_AMOUNT} USDC worth`);

//   try {
//     const fokResult = await tradingService.createMarketOrder({
//       tokenId: yesToken.tokenId,
//       side: 'BUY',
//       amount: TEST_AMOUNT,
//       orderType: 'FOK',
//     });

//     if (fokResult.success) {
//       console.log(`✅ FOK Order SUCCESS!`);
//       console.log(`   Order ID: ${fokResult.orderId}`);

//       // 等待一下让订单成交
//       await new Promise((r) => setTimeout(r, 2000));

//       // 检查持仓并卖出
//       console.log('   Selling back...');
//       const sellResult = await tradingService.createMarketOrder({
//         tokenId: yesToken.tokenId,
//         side: 'SELL',
//         amount: TEST_AMOUNT * 0.95, // 卖出略少一点确保成功
//         orderType: 'FOK',
//       });
//       console.log(`   Sell: ${sellResult.success ? '✓' : '✗'} ${sellResult.errorMsg || ''}`);
//     } else {
//       console.log(`❌ FOK Order FAILED: ${fokResult.errorMsg}`);
//     }
//   } catch (error: any) {
//     console.log(`❌ FOK Order ERROR: ${error.message}`);
//   }

//   console.log('');
}

main().catch(console.error);
