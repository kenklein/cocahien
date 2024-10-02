let tradeCount = 0; // Initialize a counter for trades
let currentBalance = 0; // Track the user's current balance
let initialBalance = 0; // Track the initial balance
const balanceHistory = []; // Array to track balance history for graphing

let chart; // Declare a variable to hold the Chart instance

// Event listener for the Buy button
document.getElementById('buyButton').addEventListener('click', function() {
    const balanceInput = parseFloat(document.getElementById('balance').value);
    const stock = document.getElementById('stock').value;
    const leverage = parseFloat(document.getElementById('leverage').value);
    const timePeriod = parseInt(document.getElementById('timePeriod').value); // Days/months selection

    // Initialize balance for the first trade
    if (tradeCount === 0) {
        if (isNaN(balanceInput) || balanceInput <= 0) {
            alert('Please enter a valid balance greater than zero.');
            return;
        }
        currentBalance = balanceInput;
        initialBalance = currentBalance; // Set initial balance
    } else {
        if (currentBalance <= 0) {
            alert('Your balance is zero or negative. Please restart the simulation.');
            return;
        }
    }

    // Show loading screen and hide results
    showLoadingScreen();

    // Simulate trade percentage for the stock over the selected period
    const stockChangePercentage = simulateStockChange(timePeriod);
    const leveragedChange = stockChangePercentage * leverage;
    const finalBalance = currentBalance + (currentBalance * (leveragedChange / 100));
    const profitOrLoss = finalBalance - currentBalance;

    // Build loading animation
    buildLoadingAnimation();

    // Show results after 3 seconds
    setTimeout(function() {
        hideLoadingScreen();
        displayResults(stock, leverage, timePeriod, stockChangePercentage, finalBalance, profitOrLoss);
        updateBalanceHistory(finalBalance, profitOrLoss, stockChangePercentage);
        drawGraph(); // Update the graph with the new balance history
    }, 3000); // 3 seconds delay to show results
});

// Function to simulate stock price change based on time period
function simulateStockChange(days) {
    const minChange = -5; // Minimum change in percentage
    const maxChange = 10; // Maximum change in percentage
    return Math.random() * (maxChange - minChange) + minChange; // Simulate a change based on the time period
}

// Show loading screen
function showLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('balanceTable').style.display = 'none'; // Hide balance table
    document.querySelector('.progress-bar').style.width = '0%'; // Reset progress bar
}

// Build loading animation
function buildLoadingAnimation() {
    let progress = 0;
    const loadingInterval = setInterval(function () {
        if (progress < 100) {
            progress += 5;
            document.querySelector('.progress-bar').style.width = `${progress}%`;
        } else {
            clearInterval(loadingInterval);
        }
    }, 150); // Small increments every 150ms for smooth loading
}

// Hide loading screen
function hideLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'none';
}

// Display results after the trade
function displayResults(stock, leverage, timePeriod, stockChangePercentage, finalBalance, profitOrLoss) {
    document.getElementById('result').style.display = 'block';
    document.getElementById('tradeSummary').innerHTML = `
        You invested in <strong>${stock}</strong> with leverage <strong>${leverage}x</strong> for <strong>${timePeriod} days</strong>.<br>
        Stock price changed by <strong>${stockChangePercentage.toFixed(2)}%</strong>.<br>
        Your balance after the trade is: <strong>€${finalBalance.toFixed(2)}</strong>.<br>
        Initial balance was: <strong>€${initialBalance.toFixed(2)}</strong>. Difference: <strong>€${(finalBalance - initialBalance).toFixed(2)}</strong> (${((finalBalance - initialBalance) / initialBalance * 100).toFixed(2)}%).
    `;
    document.getElementById('profitLoss').textContent = profitOrLoss >= 0 ? `+€${profitOrLoss.toFixed(2)}` : `-€${Math.abs(profitOrLoss).toFixed(2)}`;
}

// Update balance history
function updateBalanceHistory(finalBalance, profitOrLoss, stockChangePercentage) {
    tradeCount++;
    currentBalance = finalBalance; // Update current balance after trade
    balanceHistory.push(currentBalance); // Store current balance for graphing
    const balanceTableBody = document.querySelector('#balanceTable tbody');
    const row = balanceTableBody.insertRow();
    row.insertCell(0).textContent = tradeCount;
    row.insertCell(1).textContent = `€${currentBalance.toFixed(2)}`;
    row.insertCell(2).textContent = profitOrLoss >= 0 ? `+€${profitOrLoss.toFixed(2)}` : `-€${Math.abs(profitOrLoss).toFixed(2)}`; // Profit/Loss
    row.insertCell(3).textContent = `${stockChangePercentage.toFixed(2)}%`; // Stock change percentage

    document.getElementById('balanceTable').style.display = 'table'; // Show balance table

    // Disable balance input after the first trade
    document.getElementById('balance').disabled = true;
}

// Function to draw a simple balance graph
function drawGraph() {
    const ctx = document.getElementById('tradeGraph').getContext('2d');
    const labels = Array.from({ length: balanceHistory.length }, (_, i) => `Trade ${i + 1}`);

    // If the chart already exists, destroy it before creating a new one
    if (chart) {
        chart.destroy();
    }

    // Create a new chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Balance After Each Trade',
                data: balanceHistory,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }, {
                label: 'Normal Trade Without Leverage',
                data: labels.map(() => initialBalance + (balanceHistory[balanceHistory.length - 1] - initialBalance) / tradeCount), // Dummy line for normal trade
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
                borderDash: [5, 5] // Dashed line for normal trade
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Balance (€)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Trades'
                    }
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Reset button functionality
document.getElementById('resetButton').addEventListener('click', function() {
        document.getElementById('hedgeFundForm').reset(); // Reset form fields
        document.getElementById('result').style.display = 'none'; // Hide results
        document.getElementById('loadingScreen').style.display = 'none'; // Hide loading
        document.querySelector('.progress-bar').style.width = '0%'; // Reset progress bar
        tradeCount = 0; // Reset trade counter
        currentBalance = 0; // Reset current balance
        initialBalance = 0; // Reset initial balance
        balanceHistory.length = 0; // Reset balance history
        document.getElementById('balanceTable').style.display = 'none'; // Hide balance table
        const balanceTableBody = document.querySelector('#balanceTable tbody');
        balanceTableBody.innerHTML = ''; // Clear the table body
        document.getElementById('balance').disabled = false; // Re-enable the balance input
        if (chart) {
            chart.destroy(); // Destroy the existing chart
        }
    }
);
