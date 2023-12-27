function myFunction () {
    document.getElementById("demo3").innerHTML = "Executed external JS code line";
}

function  myStockFunction () {
    fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=BTC&apikey=PZRHDEAG8FRM7HAA')
        .then(response => response.json())
        .then(data => {
            // Extract the stock price from the API response
            const stockPrice = data['Global Quote']['05. price'];
            // Display the stock price
            document.getElementById('stockPrice').textContent = 'Apple Stock Price: ' + stockPrice;
        })
        .catch(error => {
            console.log('Error fetching stock price:', error);
        });
}