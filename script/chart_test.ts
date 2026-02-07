// import { generateCandleChart } from '../src/utils/chart.js';
// import * as fs from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Sample test data - simulating kline data with timestamps
// const testData = [
//     { t: new Date('2026-02-07T10:00:00Z').getTime(), o: 100, h: 105, l: 99, c: 102 },
//     { t: new Date('2026-02-07T10:15:00Z').getTime(), o: 102, h: 108, l: 101, c: 106 },
//     { t: new Date('2026-02-07T10:30:00Z').getTime(), o: 106, h: 110, l: 104, c: 108 },
//     { t: new Date('2026-02-07T10:45:00Z').getTime(), o: 108, h: 112, l: 107, c: 111 },
//     { t: new Date('2026-02-07T11:00:00Z').getTime(), o: 111, h: 115, l: 109, c: 113 },
//     { t: new Date('2026-02-07T11:15:00Z').getTime(), o: 113, h: 118, l: 110, c: 116 },
//     { t: new Date('2026-02-07T11:30:00Z').getTime(), o: 116, h: 120, l: 114, c: 119 },
//     { t: new Date('2026-02-07T11:45:00Z').getTime(), o: 119, h: 122, l: 117, c: 120 },
// ];

// async function testChart() {
//     try {
//         console.log('🧪 Testing chart generation...');
        
//         const chartBuffer = await generateCandleChart('BTC/USD', testData);
        
//         const outputPath = join(__dirname, '..', 'test_chart.png');
//         fs.writeFileSync(outputPath, chartBuffer);
        
//         console.log(`✅ Chart generated successfully!`);
//         console.log(`📁 Saved to: ${outputPath}`);
//         console.log(`📊 File size: ${(chartBuffer.length / 1024).toFixed(2)} KB`);
//     } catch (error) {
//         console.error('❌ Error generating chart:', error);
//         process.exit(1);
//     }
// }

// testChart();
