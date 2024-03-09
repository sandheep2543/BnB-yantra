

const firebaseConfig = {
    apiKey: "AIzaSyA05YdbNC_I0QQbkLmtoE9xbtrnQH2wfZo",
    authDomain: "bnb-yantra.firebaseapp.com",
    databaseURL: "https://bnb-yantra-default-rtdb.firebaseio.com",
    projectId: "bnb-yantra",
    storageBucket: "bnb-yantra.appspot.com",
    messagingSenderId: "19551374194",
    appId: "1:19551374194:web:4570cfb306a1015a58abeb"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);


const database = firebase.database();


//for logging purposes
var newBankerId = "21bce2742";
var newBankerData = {
    password: "1234"
};
database.ref('Login/' + newBankerId).set(newBankerData)

//stock table
var newStockId = "102"; // Use a unique ID for each stock
var stocksRef = database.ref('stocks/' + newStockId);
stocksRef.once('value').then(function (snapshot) {
    if (!snapshot.exists()) {
        var newStockData = {
            Stockname: "ABC",
            volume: 600,
            last_price: 140.02,
            curr_price: 150.01
        };
        stocksRef.set(newStockData).then(function () {
            console.log("New stock added successfully");
        }).catch(function (error) {
            console.error("Error adding new stock: ", error);
        });
    } else {
        console.log("Stock with ID " + newStockId + " already exists");
    }
});


//user
var newBankerId = "21bce2741";
var initialBalance = 600000 ; // Default balance

var newBankerData = {
    Banker_name: "john",
    Balance: initialBalance
};
database.ref('UserDb/' + newBankerId).set(newBankerData)




//transactions data
/*var newTransactionData = {
    custID: "456",
    Rate: 50,
    quantity: 10,
    transaction_time: Date.now()
};
database.ref('Transaction_record').push(newTransactionData)

*/





document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var bankerId = document.getElementById('bankerId').value;
    var password = document.getElementById('password').value;
    // Validate banker credentials
    database.ref('Login/' + bankerId).once('value').then(function (snapshot) {
        var banker = snapshot.val();
        if (banker && banker.password === password) {
            document.getElementById('stockTrading').style.display = 'block';
            populateStocks();
            populateBuyers();
        } else {
            alert('Invalid credentials');
        }
    });
});

function populateStocks() {
    var stocksRef = database.ref('stocks');
    stocksRef.once('value').then(function (snapshot) {
        var stocks = snapshot.val();
        var select = document.getElementById('stock');
        select.innerHTML = ""; // Clear existing options
        var addedStocks = {}; // Track added stocks to avoid duplicates
        for (var key in stocks) {
            var stockName = stocks[key].Stockname;
            // Check if the stock name is not already added
            if (!(stockName in addedStocks)) {
                var option = document.createElement('option');
                option.value = key;
                option.text = stockName;
                select.add(option);
                addedStocks[stockName] = true; // Mark stock as added
            }
        }
    });
}

function populateBuyers() {
    var buyersRef = database.ref('UserDb');
    buyersRef.once('value').then(function (snapshot) {
        var buyers = snapshot.val();
        var select = document.getElementById('buyer');
        select.innerHTML = ""; // Clear existing options
        for (var key in buyers) {
            var option = document.createElement('option');
            option.value = key;
            option.text = key;
            select.add(option);
        }
    });
}


document.getElementById('validate').addEventListener('click', function () {
    var stock = document.getElementById('stock').value;
    var buyer = document.getElementById('buyer').value;
    var quantity = parseInt(document.getElementById('quantity').value);
    var price = parseFloat(document.getElementById('price').value); // Use parseFloat for amount
    var type = document.getElementById('type').value;

    var stocksRef = database.ref('stocks/' + stock);
    stocksRef.once('value').then(function (snapshot) {
        var stockData = snapshot.val();
        //
        if (stockData && stockData.volume >= quantity && stockData.curr_price * quantity <= amount) {
            if (type === 'buy') {
                document.getElementById('buy').style.display = 'block';
            } else if (type === 'sell') {
                document.getElementById('sell').style.display = 'block';
            }
        } else  {
            document.getElementById('buy').style.display = 'none'; // Hide buy button
            document.getElementById('sell').style.display = 'none'; // Hide sell button
            alert('Insufficient quantity or balance');
        }
    });
});




document.getElementById('buy').addEventListener('click', function () {
    var stock = document.getElementById('stock').value;
    var buyer = document.getElementById('buyer').value;
    var quantity = parseInt(document.getElementById('quantity').value);
    var amount = parseInt(document.getElementById('amount').value);

    var stocksRef = database.ref('stocks/' + stock);
    stocksRef.once('value').then(function (snapshot) {
        var stockData = snapshot.val();
        /*if (!stockData || isNaN(stockData.volume)) {
            alert('Stock not found or invalid volume');
            return;
        }
        */

        if (stockData.volume < quantity) {
            alert('Insufficient volume');
            return;
        }

        // Calculate new balance after buying
        var newBalance = initialBalance - amount;
        if (newBalance < 0) {
            alert('Insufficient balance');
            return;
        }

        // Update stock volume and balance
        /*
        stockData.volume -= quantity;
        */
        updateBalance(newBalance);
        database.ref('stocks/' + stock).set(stockData);
        
        

            // Update the buyer's balance
            var userRef = database.ref('UserDb/' + buyer + '/Balance');
            userRef.once('value').then(function (userSnapshot) {
                var userBalance = userSnapshot.val();
                if (isNaN(userBalance)) {
                    alert('Invalid user balance');
                    return;
                }

                var newBuyerBalance = userBalance - amount;
                userRef.set(newBuyerBalance);

                // Add transaction details
                addTransaction('seller_id_here', buyer, stock, amount, 'buy');

                alert('Stock bought successfully!');
            });
        });
    });






document.getElementById('sell').addEventListener('click', function () {
    var stock = document.getElementById('stock').value;
    var buyer = document.getElementById('buyer').value;
    var quantity = parseInt(document.getElementById('quantity').value);
    var amount = parseInt(document.getElementById('amount').value);

    var stocksRef = database.ref('stocks/' + stock);
    stocksRef.once('value').then(function (snapshot) {
        var stockData = snapshot.val();
        if (!stockData) {
            alert('Stock not found');
            return;
        }

        if (isNaN(stockData.volume)) {
            alert('Invalid volume for stock');
            return;
        }

        if (stockData.volume < quantity) {
            alert('Insufficient volume');
            return;
        }

        // Update the stock volume
        stockData.volume += quantity;
        database.ref('stocks/' + stock).set(stockData);

        // Get the seller's ID from UserDb
        var sellerId;
        var sellersRef = database.ref('UserDb');
        sellersRef.once('value').then(function (snapshot) {
            var sellers = snapshot.val();
            for (var key in sellers) {
                if (sellers[key].Banker_name === sellers[key].Banker_name) {
                    sellerId = key;
                    break;
                }
            }

            if (!sellerId) {
                alert('Seller not found');
                return;
            }

            // Update the user's balance
            var userRef = database.ref('UserDb/' + sellerId + '/Balance');
            userRef.once('value').then(function (userSnapshot) {
                var userBalance = userSnapshot.val();
                if (isNaN(userBalance)) {
                    alert('Invalid user balance');
                    return;
                }

                // Calculate the selling amount
                var sellingAmount = stockData.curr_price * quantity;

                // Calculate the new balance after selling
                var newBalance = userBalance + sellingAmount;

                // Update the user's balance
                userRef.set(newBalance);

                // Add transaction details
                addTransaction(sellerId, buyer, stock, sellingAmount, 'sell');

                alert('Stock sold successfully!');
            });
        });
    });
});



function addTransaction(sellerId, buyerId, stockId, amount, type) {
    var transactionId = database.ref().child('Transaction_record').push().key; // Generates a unique transaction ID
    var newTransactionData = {
        time: Date.now(),
        stockId: stockId,
        amount: amount,
        type: type
    };

    if (type === 'buy') {
        newTransactionData.buyerID = buyerId;
    } else if (type === 'sell') {
        newTransactionData.sellerID = sellerId;
    }

    database.ref('Transaction_record/' + transactionId).set(newTransactionData)
}


function updateBalance(newBalance) {
    database.ref('UserDb/' + newBankerId + '/Balance').set(newBalance);
}