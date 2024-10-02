let tradeCount = 0; // Initialize a counter for trades
let currentBalance = 0; // Track the user's current balance
let initialBalance = 0; // Track the initial balance
let balanceHistory = []; // Array to hold balance history for the graph

// Event listener for the Buy button
document.getElementById('buyButton').addEventListener('click', function () {
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

    // Show loading screen for the new trade information
    showLoadingScreen();

    // Simulate trade percentage for the stock over the selected period
    const stockChangePercentage = simulateStockChange(timePeriod);
    const leveragedChange = stockChangePercentage * leverage;
    const finalBalance = currentBalance + (currentBalance * (leveragedChange / 100));
    const profitOrLoss = finalBalance - currentBalance;

    // Build loading animation
    buildLoadingAnimation();

    // Show results after 1.5 seconds
    setTimeout(function () {
        hideLoadingScreen();
        displayResults(stock, leverage, timePeriod, stockChangePercentage, finalBalance, profitOrLoss);
        updateBalanceHistory(finalBalance, profitOrLoss, stockChangePercentage, stock, leverage); // Updated call with stock and leverage
        drawGraph(); // Update the graph with the new balance history
    }, 1500); // Reduced to 1.5 seconds delay to show results
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
    document.getElementById('result').style.display = 'none'; // Hide the results during loading
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
    }, 100); // Small increments every 100ms for smooth loading
}

// Hide loading screen
function hideLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'none';
}

// Display results after the trade
function displayResults(stock, leverage, timePeriod, stockChangePercentage, finalBalance, profitOrLoss) {
    document.getElementById('result').style.display = 'block';
    document.getElementById('tradeSummary').innerHTML = `
        You invested in <strong>${stock}</strong> with a leverage of <strong>${leverage}x</strong> for <strong>${timePeriod} days</strong>.<br>
        The stock price changed by <strong>${stockChangePercentage.toFixed(2)}%</strong>, which means your investment has been significantly impacted.<br>
        Your balance after the trade is: <strong>€${finalBalance.toFixed(2)}</strong>.<br>
        Your initial balance was: <strong>€${initialBalance.toFixed(2)}</strong>.<br>
        This represents a difference of <strong>€${(finalBalance - initialBalance).toFixed(2)}</strong>, which is a <strong>${(((finalBalance - initialBalance) / initialBalance) * 100).toFixed(2)}%</strong> change.
    `;
    document.getElementById('profitLoss').textContent = profitOrLoss >= 0 ? `+€${profitOrLoss.toFixed(2)}` : `-€${Math.abs(profitOrLoss).toFixed(2)}`;
}

// Update balance history
function updateBalanceHistory(finalBalance, profitOrLoss, stockChangePercentage, stock, leverage) {
    tradeCount++;
    currentBalance = finalBalance; // Update current balance after trade
    balanceHistory.push(currentBalance); // Store current balance for graphing
    const balanceTableBody = document.querySelector('#balanceTable tbody');
    const row = balanceTableBody.insertRow();

    // Insert trade information into the table
    row.insertCell(0).textContent = tradeCount; // Trade #
    row.insertCell(1).textContent = `€${currentBalance.toFixed(2)}`; // New Balance
    row.insertCell(2).textContent = profitOrLoss >= 0 ? `+€${profitOrLoss.toFixed(2)}` : `-€${Math.abs(profitOrLoss).toFixed(2)}`; // Profit/Loss
    row.insertCell(3).textContent = `${stockChangePercentage.toFixed(2)}%`; // Stock change percentage
    row.insertCell(4).textContent = stock; // Stock traded
    row.insertCell(5).textContent = `${leverage}x`; // Leverage used

    document.getElementById('balanceTable').style.display = 'table'; // Show balance table

    // Disable balance input after the first trade
    document.getElementById('balance').disabled = true;
}

// Function to draw a simple balance graph
function drawGraph() {
    const ctxBalance = document.getElementById('tradeGraph').getContext('2d');
    const labels = Array.from({ length: tradeCount }, (_, i) => `Trade ${i + 1}`);

    // Get the balance data
    const balanceData = balanceHistory; // Use balance history for graphing

    // Get dynamic min and max for balance
    const minBalance = Math.min(...balanceData);
    const maxBalance = Math.max(...balanceData);

    // Clear the previous chart instance
    if (window.balanceChart) {
        window.balanceChart.destroy();
    }

    // Set up balance chart
    window.balanceChart = new Chart(ctxBalance, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Balance After Each Trade',
                data: balanceData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    min: minBalance - (maxBalance - minBalance) * 0.1, // Dynamic min for better visualization
                    max: maxBalance + (maxBalance - minBalance) * 0.1, // Dynamic max for better visualization
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
