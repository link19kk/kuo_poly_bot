// import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
// import { ChartConfiguration } from 'chart.js';

// const width = 800; // px
// const height = 400; // px
// const chartCallback = (ChartJS: any) => {
//     // Register the time scale adapter
//     ChartJS.register(require('chartjs-adapter-luxon'));
// };

// const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

// export async function generateCandleChart(
//     label: string, 
//     data: { t: number; o: number; h: number; l: number; c: number }[]
// ): Promise<Buffer> {
    
//     // Prepare data for Chart.js
//     // Note: Chart.js expects 'x' for time and 'y' for values, but financial charts 
//     // often use specific structures. Here we simulate a candlestick using a bar chart
//     // or use a specialized library. For simplicity, we'll draw a "High-Low" bar
//     // and overlay "Open-Close" blocks, but using a dedicated financial plugin is better.
//     // 
//     // HOWEVER, standard Chart.js requires 'chartjs-chart-financial' for real candles.
//     // To keep it simple and robust without too many plugins, we will render a 
//     // Line Chart for the Close price with error bars, OR just a Line Chart 
//     // if you want simplicity. 
    
//     // Let's implement a robust "Line + Area" chart for the Close price 
//     // because drawing raw candles in backend JS without heavy plugins is error-prone.
//     // If you strictly need Candles, we need 'chartjs-chart-financial'.
    
//     // Let's stick to a clear "Price History" Line Chart for now (easiest to maintain).
//     // If you specifically need Candle Sticks, tell me and I will add that plugin.
    
//     const configuration: ChartConfiguration = {
//         type: 'line',
//         data: {
//             datasets: [{
//                 label: `${label} Price`,
//                 data: data.map(d => ({ x: d.t, y: d.c })), // Plotting Close Price
//                 borderColor: 'rgb(75, 192, 192)',
//                 backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                 borderWidth: 2,
//                 fill: true,
//                 tension: 0.1,
//                 pointRadius: 0
//             }]
//         },
//         options: {
//             scales: {
//                 x: {
//                     type: 'time',
//                     time: { unit: 'hour' },
//                     ticks: { color: 'white' }
//                 },
//                 y: {
//                     ticks: { color: 'white' },
//                     grid: { color: 'rgba(255,255,255,0.1)' }
//                 }
//             },
//             plugins: {
//                 legend: { labels: { color: 'white' } }
//             },
//             layout: { padding: 20 }
//         },
//         plugins: [{
//             id: 'custom_background',
//             beforeDraw: (chart) => {
//                 const ctx = chart.ctx;
//                 ctx.save();
//                 ctx.globalCompositeOperation = 'destination-over';
//                 ctx.fillStyle = '#1e1e1e'; // Dark background
//                 ctx.fillRect(0, 0, chart.width, chart.height);
//                 ctx.restore();
//             }
//         }]
//     };

//     return await chartJSNodeCanvas.renderToBuffer(configuration);
// }