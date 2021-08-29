# 1inch-bot
1inch exchange trade bot that allows for limit orders, stop loss oders, take profits on polygon (matic)


# running the app

## install dependencies

`yarn` or `npm i`

## set trade parameters in de `trade-params.json`

```
{
  "orders": [
    {
      "symbol": "amWMATIC",
      "quote": "amUSDC",
      "chain": 137,
      "type": "BUY",
      "price": 1.43,
      "amount": 50,
      "status": 2
    },
    {
      "symbol": "amWMATIC",
      "quote": "amUSDC",
      "chain": 137,
      "type": "SELL",
      "price": 1.45,
      "amount": 35,
      "status": 2
    },
    {
      "symbol": "QUICK",
      "quote": "USDC",
      "chain": 137,
      "type": "SELL",
      "price": 750,
      "amount": 14,
      "status": 0
    }
  ]
}
```

quote is the symbol you are trading against, in my example i'm swapping from/to amUSDC.

status should be initially set to 0, when an order is executed, the app will change status to 1.
if you want to have an order recur, set status to 2.

## copy the `.env-example` and rename it to `.env`, adjust the values.

`REFRESH_INTERVAL` is the interval the bot updates prices/trades in milliseconds. The example is set to 1 minute


