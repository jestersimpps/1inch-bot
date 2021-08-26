import { TradeParam } from "./models";
import { Api } from "./api";

const updateExecuted = async (db, order: TradeParam) => {
  if (order.status === 0) {
    const orders: TradeParam[] = await db.get("orders");
    const filteredOrders = orders.filter((o) => o.symbol !== order.symbol && o.price !== order.price && o.chain !== order.chain && o.amount !== order.amount);
    await db.set("orders", [...filteredOrders, { ...order, status: 1 }]);
  }
};

export const limitBuy = async (api: Api, db, tokens, order: TradeParam) => {
  const tradeToken = tokens.find((t) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t) => t.symbol === order.quote);

  const currentPrice = tradeToken.price / quoteToken.price;
  if (order.amount > quoteToken.balance) {
    console.log(`BUY ${order.amount} ${tradeToken.symbol} - not enough balance - balance: ${quoteToken.balance}`);
  } else {
    if (currentPrice <= order.price) {
      const swap = await api.swap(quoteToken, tradeToken, order.amount, order.slippage, order.chain);
      await updateExecuted(db, order);
      console.log(swap);
    } else {
      console.log(`BUY ${order.amount} ${tradeToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is below ${order.price} - last price: ${currentPrice}`);
    }
  }
};

export const limitSell = async (api: Api, db, tokens, order: TradeParam) => {
  const tradeToken = tokens.find((t) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t) => t.symbol === order.quote);

  const currentPrice = tradeToken.price / quoteToken.price;

  if (order.amount > tradeToken.balance) {
    console.log(`SELL ${order.amount} ${tradeToken.symbol} - not enough balance - balance: ${tradeToken.balance}`);
  } else {
    if (currentPrice >= order.price) {
      const swap = await api.swap(tradeToken, quoteToken, order.amount, order.slippage, order.chain);
      await updateExecuted(db, order);
      console.log(swap);
    } else {
      console.log(`SELL ${order.amount} ${tradeToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is above ${order.price} - last price: ${currentPrice}`);
    }
  }
};

export const stopLoss = async (api: Api, db, tokens, order: TradeParam) => {
  const tradeToken = tokens.find((t) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t) => t.symbol === order.quote);

  const currentPrice = tradeToken.price / quoteToken.price;

  if (order.amount > tradeToken.balance) {
    console.log(`SELL ${order.amount} ${tradeToken.symbol} - not enough balance - balance: ${tradeToken.balance}`);
  } else {
    if (currentPrice <= order.price) {
      const swap = await api.swap(tradeToken, quoteToken, order.amount, order.slippage, order.chain);
      await updateExecuted(db, order);
      console.log(swap);
    } else {
      console.log(`SELL ${order.amount} ${tradeToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is below ${order.price} - last price: ${currentPrice}`);
    }
  }
};
