require("dotenv").config();
const JSONdb = require("simple-json-db");

import { TradeParam } from "./models";
import { Api } from "./api";
import { limitBuy, limitSell, stopLoss } from "./auto-trade";

const db = new JSONdb("trade-params.json");
const api = new Api();

const executeOrders = async () => {
  const orders: TradeParam[] = await db.get("orders");
  let lastChain = null;
  let tokens = [];
  for (const order of orders) {
    if (!lastChain || order.chain !== lastChain) {
      tokens = await api.getTokenList(order.chain);
      lastChain = order.chain;
    }

    // 0 is pending, 1 is executed, 2 is repeating
    if (order.status !== 1) {
      if (order.type === "BUY") await limitBuy(api, db, tokens, order);
      if (order.type === "SELL") await limitSell(api, db, tokens, order);
      if (order.type === "STOPSELL") await stopLoss(api, db, tokens, order);
    }
  }
};

const init = async () => {
  await executeOrders();
  setInterval(async () => await executeOrders(), +process.env.REFRESH_INTERVAL);
};

init();
