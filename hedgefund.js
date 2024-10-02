document.getElementById('buyButton').addEventListener('click', function() {
    const balance = parseFloat(document.getElementById('balance').value);
    const stock = document.getElementById('stock').value;
    const leverage = parseFloat(document.getElementById('leverage').value);
    const timePeriod = parseInt(document.getElementById('timePeriod').value); // Days/months selection

    if (isNaN(balance) || balance <= 0) {
        alert('Please enter a valid balance.');
        return;
    }

    // Show loading screen and hide result
    document.getElementById('loadingScreen').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.querySelector('.progress-bar').style.width = '0%'; // Reset progress bar

    // Simulate trade percentage for the stock over the selected period
    const stockChangePercentage = simulateStockChange(timePeriod);
    const leveragedChange = stockChangePercentage * leverage;
    const finalBalance = balance + (balance * (leveragedChange / 100));
    const normalFinalBalance = balance + (balance * (stockChangePercentage / 100)); // Without leverage

    // Build loading animation
    let progress = 0;
    const loadingInterval = setInterval(function () {
        if (progress < 100) {
            progress += 5;
            document.querySelector('.progress-bar').style.width = `${progress}%`;
        } else {
            clearInterval(loadingInterval);
        }
    }, 150); // Small increments every 150ms for smooth loading

    // Show results after 3 seconds
    setTimeout(function() {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('result').style.display = 'block';

        // Update the trade summary and Profit/Loss
        const profitOrLoss = finalBalance - balance;
        document.getElementById('tradeSummary').innerHTML = `
            You invested in <strong>${stock}</strong> with leverage <strong>${leverage}x</strong> for <strong>${timePeriod} days</strong>.<br>
            Stock price changed by <strong>${stockChangePercentage.toFixed(2)}%</strong>.<br>
            Your balance after the trade is: <strong>$${finalBalance.toFixed(2)}</strong>.
        `;
        document.getElementById('profitLoss').textContent = profitOrLoss >= 0 ? `+$${profitOrLoss.toFixed(2)}` : `-$${Math.abs(profitOrLoss).toFixed(2)}`;

        // Generate the graph
        buildTradeGraph(stockChangePercentage, leveragedChange, timePeriod, balance, finalBalance, normalFinalBalance);

    }, 3000); // 3-second delay
});

// Function to simulate stock price change based on the selected time period
function simulateStockChange(timePeriod) {
    const volatility = timePeriod >= 30 ? 0.5 : 0.2; // Larger time periods have more volatility
    return getRandomPercentage(-5 * volatility, 10 * volatility); // Random percentage based on volatility
}

// Function to get a random percentage for stock price change
function getRandomPercentage(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to build and animate the graph using Chart.js
function buildTradeGraph(stockChangePercentage, leveragedChange, timePeriod, balance, finalBalance, normalFinalBalance) {
    const ctx = document.getElementById('tradeGraph').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Initial Balance', `${timePeriod} Days Later`],
            datasets: [
                {
                    label: 'Normal Trading',
                    data: [balance, normalFinalBalance],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Leveraged Trading',
                    data: [balance, finalBalance],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            animation: {
                duration: 3000, // Animate for 3 seconds
                onComplete: function () {
                    const chartInstance = this.chart;
                    const ctx = chartInstance.ctx;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText('Investment Growth Over Time', chartInstance.width / 2, 20);
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Days)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value ($)'
                    }
                }
            }
        }
    });
}
