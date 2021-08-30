# 1inch-bot

1inch exchange trade bot that allows for limit orders, stop loss oders, take profits on ethereum/polygon (matic)

# configuring the app

## install dependencies

`yarn` or `npm i`

## configure orders

set trade parameters in de `trade-params.json`

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
      "recurring": true,
      "status": "PENDING"
    },
    {
      "symbol": "amWMATIC",
      "quote": "amUSDC",
      "chain": 137,
      "type": "SELL",
      "price": 1.45,
      "amount": 35,
      "recurring": true,
      "status": "PENDING"
    },
    {
      "symbol": "QUICK",
      "quote": "USDC",
      "chain": 137,
      "type": "SELL",
      "price": 750,
      "amount": 14,
      "status": "PENDING"
    }
  ]
}
```

quote is the symbol you are trading against, in my example i'm swapping from/to amUSDC.
if you want to set up a recurring order, add the parameter recurring and set it to `true`.

## hook it up to your wallet

copy the `.env-example` and rename it to `.env`, adjust the values.

`REFRESH_INTERVAL` is the interval the bot updates prices/trades in milliseconds. The example is set to 1 minute

you can extract your public and private keys from your metamask browser extention.

\*\*Also be sure to approve the allowances in the 1inch app first, I still need to add a piece of code that approves the allowances in the bot.

# compiling and running the app

## compilation

be sure you have typescript installed

`tsc`

## running after compilation

`node dist/main`
