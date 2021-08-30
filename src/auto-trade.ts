import { TradeParam } from "./models";
import { Api } from "./api";
import axios from "axios";

const updateStatus = async (db, order: TradeParam, status: string) => {
  const orders: TradeParam[] = await db.get("orders");
  const filteredOrders = orders.filter((o) => o.id !== order.id);
  await db.set("orders", [...filteredOrders, { ...order, status: status }]);
};

export const limitBuy = async (api: Api, db, tokens, order: TradeParam) => {
  const tradeToken = tokens.find((t) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t) => t.symbol === order.quote);

  if (tradeToken && quoteToken) {
    const currentPrice = tradeToken.price / quoteToken.price;

    if (order.amount > quoteToken.balance) {
      console.log(`BUY ${order.amount} ${tradeToken.symbol} for${order.amount * order.price} ${quoteToken.symbol} - not enough balance - balance: ${quoteToken.balance}`);
    } else {
      console.log(
        `BUY ${order.amount} ${tradeToken.symbol} for ${order.amount * order.price} ${quoteToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is below ${
          order.price
        } - last price: ${currentPrice}`
      );
      if (currentPrice <= order.price) {
        updateStatus(db, order, "EXECUTING");
        const scannerUrl = await api.swap(quoteToken, tradeToken, order.amount * order.price, order.force, order.slippage, order.chain);
        if (scannerUrl) {
          if (order.recurring) {
            updateStatus(db, order, "PENDING");
          } else {
            updateStatus(db, order, "EXECUTED");
          }
        } else {
          updateStatus(db, order, "PENDING");
        }
      }
    }
  } else {
    console.log(`API busy`);
  }
};

export const limitSell = async (api: Api, db, tokens, order: TradeParam) => {
  const tradeToken = tokens.find((t) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t) => t.symbol === order.quote);
  if (tradeToken && quoteToken) {
    const currentPrice = tradeToken.price / quoteToken.price;

    if (order.amount > tradeToken.balance) {
      console.log(`SELL ${order.amount} ${tradeToken.symbol} for ${order.amount * order.price} ${quoteToken.symbol} - not enough balance - balance: ${tradeToken.balance}`);
    } else {
      console.log(
        `SELL ${order.amount} ${tradeToken.symbol} for ${order.amount * order.price} ${quoteToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is above ${
          order.price
        } - last price: ${currentPrice}`
      );

      if (currentPrice >= order.price) {
        updateStatus(db, order, "EXECUTING");
        const scannerUrl = await api.swap(tradeToken, quoteToken, order.amount, order.force, order.slippage, order.chain);
        if (scannerUrl) {
          if (order.recurring) {
            updateStatus(db, order, "PENDING");
          } else {
            updateStatus(db, order, "EXECUTED");
          }
        } else {
          updateStatus(db, order, "PENDING");
        }
      }
    }
  } else {
    console.log(`API busy`);
  }
};

export const stopBuy = async (api: Api, db, tokens, order: TradeParam) => {
  const tradeToken = tokens.find((t) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t) => t.symbol === order.quote);

  if (tradeToken && quoteToken) {
    const currentPrice = tradeToken.price / quoteToken.price;

    if (order.amount > quoteToken.balance) {
      console.log(`BUY ${order.amount} ${tradeToken.symbol} for${order.amount * order.price} ${quoteToken.symbol} - not enough balance - balance: ${quoteToken.balance}`);
    } else {
      console.log(
        `BUY ${order.amount} ${tradeToken.symbol} for ${order.amount * order.price} ${quoteToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is above ${
          order.price
        } - last price: ${currentPrice}`
      );
      if (currentPrice >= order.price) {
        updateStatus(db, order, "EXECUTING");
        const scannerUrl = await api.swap(quoteToken, tradeToken, order.amount * order.price, order.force, order.slippage, order.chain);
        if (scannerUrl) {
          if (order.recurring) {
            updateStatus(db, order, "PENDING");
          } else {
            updateStatus(db, order, "EXECUTED");
          }
        } else {
          updateStatus(db, order, "PENDING");
        }
      }
    }
  } else {
    console.log(`API busy`);
  }
};


export const stopSell = async (api: Api, db, tokens, order: TradeParam) => {
  const tradeToken = tokens.find((t) => t.symbol === order.symbol);
  const quoteToken = tokens.find((t) => t.symbol === order.quote);
  if (tradeToken && quoteToken) {
    const currentPrice = tradeToken.price / quoteToken.price;

    if (order.amount > tradeToken.balance) {
      console.log(`SELL ${order.amount} ${tradeToken.symbol} for ${order.amount * order.price} ${quoteToken.symbol} - not enough balance - balance: ${tradeToken.balance}`);
    } else {
      console.log(
        `SELL ${order.amount} ${tradeToken.symbol} for ${order.amount * order.price} ${quoteToken.symbol} when ${tradeToken.symbol}/${quoteToken.symbol} price is below ${
          order.price
        } - last price: ${currentPrice}`
      );
      if (currentPrice <= order.price) {
        updateStatus(db, order, "EXECUTING");
        const scannerUrl = await api.swap(tradeToken, quoteToken, order.amount, order.force, order.slippage, order.chain);
        if (scannerUrl) {
          if (order.recurring) {
            updateStatus(db, order, "PENDING");
          } else {
            updateStatus(db, order, "EXECUTED");
          }
        } else {
          updateStatus(db, order, "PENDING");
        }
      }
    }
  } else {
    console.log(`API busy`);
  }
};
