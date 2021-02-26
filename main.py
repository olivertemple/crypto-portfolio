from binance.client import Client
from pprint import pprint
from flask import Flask, request
from flask.helpers import stream_with_context
from flask_cors import CORS
import time
app = Flask("__name__")
CORS(app)

@app.route("/", methods=["POST"])
def home():
    start = time.time()
    request_data = request.get_json()
    client = Client(request_data["key"], request_data["secret"])
    coins = []
    USDTGBP = float((client.get_symbol_ticker(symbol=("GBPUSDT")))['price'])

    for item in (client.get_account()['balances']):
        if float(item['free'])!=0 or float(item['locked'])!=0:
            total = float(item['free']) + float(item['locked'])
            coinPair = item['asset']+"USDT"
            try:
                price = client.get_ticker(symbol = coinPair)
                item['price'] = float(price['lastPrice'])/USDTGBP
                item['value'] = (float(price['lastPrice'])*total)/USDTGBP
                item['change'] = float(price['priceChangePercent'])
                coins.append(item)
            except:
                item['price'] = 1/USDTGBP
                item['value'] = float(item['locked'])+ float(item['free'])/USDTGBP
                item['change'] = float(client.get_ticker(symbol = "GBPUSDT")['priceChangePercent'])
                coins.append(item)
    port = {}
    port['assets'] = coins
    total = 0
    for item in port['assets']:
        total += item['value']
    port['total'] = total


    #port['open_orders']=(client.get_open_orders())
    finnish = time.time()
    print(finnish-start)
    return(port)

@app.route("/orders", methods=['POST'])
def orders():
    request_data = request.get_json()
    client = Client(request_data["key"], request_data["secret"])
    response = {}
    response['orders'] = client.get_open_orders()
    client.get_deposit_history()
    return response
key = "BJt2jYCTXZKvMJkrrhXRxVa5qtwpUuIL0MHtZiZFpkw810n3Mei3Xbz7QzdQlMEm"
secret = "UblqJgYTOf0WAvH5HjZNAj3RJFu8NbowVwOilHscVDaB7dY0gAojNgLoVY4PuLRe"

if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000, host="0.0.0.0")